#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_msg.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "transaction.h"

#define IS_PRINTABLE(c) (c >= 0x20 && c <= 0x7e)

uint32_t  account;
uint8_t network;
poseidon_mode_t poseidon_mode;

void handle_sign_msg(uint8_t p1, uint8_t p2, uint8_t *dataBuffer, uint8_t dataLength, volatile unsigned int *flags, poseidon_mode_t mode)
{
    UNUSED(p1);
    UNUSED(p2);

    uint8_t msg_buffer[255] = {0};
    poseidon_mode = mode;

    if (dataLength > sizeof(msg_buffer)) {
        THROW(INVALID_PARAMETER);
    }

    if (dataLength <= ACCOUNT_LENGTH + NETWORK_LENGTH) {
        THROW(INVALID_PARAMETER);
    }

    account = read_uint32_be(dataBuffer);
    network = dataBuffer[NETWORK_OFFSET];

    if (network != TESTNET_ID && network != MAINNET_ID) {
        THROW(INVALID_PARAMETER);
    }

    memcpy(msg_buffer, dataBuffer + MSG_OFFSET, dataLength - (ACCOUNT_LENGTH + NETWORK_LENGTH));

    ui_sign_msg(msg_buffer, dataLength - (ACCOUNT_LENGTH + NETWORK_LENGTH), network);
    *flags |= IO_ASYNCH_REPLY;
}

void sign_message(uint8_t *dataBuffer, uint8_t dataLength)
{
    Keypair   kp;
    Signature sig;
    Field   input_fields[0];
    uint8_t bits[TX_BITSTRINGS_BYTES];
    ROInput   roinput = roinput_create(input_fields, bits);

    if (poseidon_mode == POSEIDON_LEGACY) {
        // Add PREFIX to the buffer
        const uint8_t prefix_len = strlen(PREFIX);
        uint8_t prefixed_buffer[5 + TX_BITSTRINGS_BYTES];

        if (dataLength + prefix_len > sizeof(prefixed_buffer)) {
            THROW(INVALID_PARAMETER);
        }
        
        memcpy(prefixed_buffer, PREFIX, prefix_len);
        memcpy(prefixed_buffer + prefix_len, dataBuffer, dataLength);
        dataLength += prefix_len;
        dataBuffer = prefixed_buffer;
    }


    if ((dataLength < ACCOUNT_LENGTH + NETWORK_LENGTH) || (dataLength > 5 + TX_BITSTRINGS_BYTES)) {
        THROW(INVALID_PARAMETER);
    }

    if (dataBuffer == NULL) {
        THROW(INVALID_PARAMETER);
    }

    for (uint8_t i = 0; i < dataLength; i++) {
        uint8_t digit = dataBuffer[i];
        if (digit != '\r' && digit != '\n' && !IS_PRINTABLE(digit)) {
            THROW(INVALID_PARAMETER);
        }
    }

    if (roinput_add_bytes_le(&roinput, dataBuffer, dataLength) < 0) {
        THROW(INVALID_PARAMETER);
    }

    generate_keypair(&kp, account);

    BEGIN_TRY {
        TRY {
            if (!sign(&sig, &kp, &roinput, network, poseidon_mode)) {
                THROW(INVALID_PARAMETER);
            }
        }
        FINALLY {
            // Clear secret from stack
            explicit_bzero(kp.priv, sizeof(kp.priv));
        }
        END_TRY;
    }

    memmove(G_io_apdu_buffer, &sig, sizeof(sig));

    G_io_apdu_buffer[sizeof(sig)] = dataLength;
    memmove(G_io_apdu_buffer + sizeof(sig) + 1, dataBuffer, dataLength);
    sendResponse(sizeof(sig) + 1 + dataLength, true);
}

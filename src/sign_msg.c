#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_msg.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "transaction.h"

#define IS_PRINTABLE(c) (c >= 0x20 && c <= 0x7e)

void handle_sign_msg(uint8_t p1, uint8_t p2, uint8_t *dataBuffer, uint8_t dataLength, volatile unsigned int *flags)
{
    UNUSED(p1);
    UNUSED(p2);

    ui_sign_msg(dataBuffer, dataLength);
    *flags |= IO_ASYNCH_REPLY;
}

void sign_message(uint8_t *dataBuffer, uint8_t dataLength)
{
    Keypair   kp;
    Signature sig;
    Field   input_fields[0];
    uint8_t bits[TX_BITSTRINGS_BYTES];
    ROInput   roinput = roinput_create(input_fields, bits);
    uint32_t  account;
    uint8_t network;

    if ((dataLength < ACCOUNT_LENGTH + NETWORK_LENGTH) || (dataLength + 5 > 255)) {
        THROW(INVALID_PARAMETER);
    }

    account = read_uint32_be(dataBuffer);
    network = dataBuffer[NETWORK_OFFSET];

    for (uint8_t i = MSG_OFFSET; i < dataLength; i++) {
        uint8_t digit = dataBuffer[i];
        if (digit != '\r' && digit != '\n' && !IS_PRINTABLE(digit)) {
            THROW(INVALID_PARAMETER);
        }
    }

    generate_keypair(&kp, account);

    roinput_add_bytes_le(&roinput, dataBuffer + MSG_OFFSET, dataLength - (ACCOUNT_LENGTH + NETWORK_LENGTH));

    if (!sign(&sig, &kp, &roinput, network)) {
        THROW(INVALID_PARAMETER);
    }

    memmove(G_io_apdu_buffer, &sig, sizeof(sig));

    sendResponse(sizeof(sig), true);
}

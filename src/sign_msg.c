#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_msg.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "transaction.h"

#define IS_PRINTABLE(c) (c >= 0x20 && c <= 0x7e)

uint8_t msg_buffer[255];
uint32_t  account;
uint8_t network;

void handle_sign_msg(uint8_t p1, uint8_t p2, uint8_t *dataBuffer, uint8_t dataLength, volatile unsigned int *flags)
{
    UNUSED(p1);
    UNUSED(p2);

    memset(msg_buffer, 0, sizeof(msg_buffer));
    const char prefix[] = PREFIX;

    if (dataLength + strlen(prefix) > sizeof(msg_buffer)) {
        THROW(INVALID_PARAMETER);
    }

    account = read_uint32_be(dataBuffer);
    network = dataBuffer[NETWORK_OFFSET];

    memcpy(msg_buffer, prefix, strlen(prefix));
    memcpy(msg_buffer + strlen(prefix), dataBuffer + MSG_OFFSET, dataLength - (ACCOUNT_LENGTH + NETWORK_LENGTH));

    ui_sign_msg(msg_buffer, strlen(prefix) + dataLength - (ACCOUNT_LENGTH + NETWORK_LENGTH));
    *flags |= IO_ASYNCH_REPLY;
}

void sign_message(uint8_t *dataBuffer, uint8_t dataLength)
{
    Keypair   kp;
    Signature sig;
    Field   input_fields[0];
    uint8_t bits[TX_BITSTRINGS_BYTES];
    ROInput   roinput = roinput_create(input_fields, bits);

    if ((dataLength < ACCOUNT_LENGTH + NETWORK_LENGTH) || (dataLength > 5 + TX_BITSTRINGS_BYTES)) {
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
            if (!sign(&sig, &kp, &roinput, network)) {
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

    sendResponse(sizeof(sig), true);
}

#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_msg.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "transaction.h"
#include "sign_zk_field.h"

static uint32_t  account;
static uint8_t network;

void handle_sign_zkapp_field(uint8_t p1, uint8_t p2, uint8_t *dataBuffer, uint8_t dataLength, volatile unsigned int *flags)
{
    UNUSED(p1);
    UNUSED(p2);

    uint8_t field_buffer[255] = {0};

    account = read_uint32_be(dataBuffer);
    network = dataBuffer[NETWORK_OFFSET];

    if (network != TESTNET_ID && network != MAINNET_ID) {
        THROW(INVALID_PARAMETER);
    }

    memcpy(field_buffer, dataBuffer + FIELD_OFFSET, dataLength - (ACCOUNT_LENGTH + NETWORK_LENGTH));

    ui_sign_zkapp_field(field_buffer, dataLength - (ACCOUNT_LENGTH + NETWORK_LENGTH), network);
    *flags |= IO_ASYNCH_REPLY;

}

void sign_zkapp_field(uint8_t *dataBuffer, uint8_t dataLength)
{
    Keypair   kp;
    Signature sig;
    Field   input_fields[0];
    uint8_t bits[TX_BITSTRINGS_BYTES];
    ROInput   roinput = roinput_create(input_fields, bits);
 
    if ((dataLength < ACCOUNT_LENGTH + NETWORK_LENGTH) || (dataLength > 5 + TX_BITSTRINGS_BYTES)) {
        THROW(INVALID_PARAMETER);
    }

    if (dataBuffer == NULL) {
        THROW(INVALID_PARAMETER);
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

#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_tx.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"

void handle_sign_tx(uint8_t p1, uint8_t p2, uint8_t *dataBuffer,
                    uint8_t dataLength, volatile unsigned int *flags)
{
    UNUSED(p1);
    UNUSED(p2);

    ui_sign_tx(dataBuffer, dataLength);
    *flags |= IO_ASYNCH_REPLY;
}

void sign_transaction(tx_t* tx, ui_t* ui)
{
    char      address[MINA_ADDRESS_LEN];
    Signature sig;
    ROInput   roinput;
    Keypair   kp;
    bool      error = false;

    BEGIN_TRY {
        TRY {
            // Get the account's private key and validate corresponding
            // public key matches the from address
            generate_keypair(&kp, tx->account);
            if (!generate_address(address, sizeof(address), &kp.pub)) {
                THROW(INVALID_PARAMETER);
            }
            if (memcmp(address, ui->from, sizeof(address)) != 0) {
                THROW(INVALID_PARAMETER);
            }

            // Create random oracle input from transaction
            roinput.fields = tx->input_fields;
            roinput.fields_capacity = ARRAY_LEN(tx->input_fields);
            roinput.bits = tx->input_bits;
            roinput.bits_capacity = ARRAY_LEN(tx->input_bits);
            transaction_to_roinput(&roinput, &tx->tx);

            if (!sign(&sig, &kp, &roinput, tx->network_id)) {
                THROW(INVALID_PARAMETER);
            }
        }
        CATCH_OTHER(e) {
            error = true;
        }
        FINALLY {
            // Clear private key from memory
            explicit_bzero((void *)kp.priv, sizeof(kp.priv));
        }
        END_TRY;
    }

    if (error) {
        THROW(INVALID_PARAMETER);
    }

    memmove(G_io_apdu_buffer, &sig, sizeof(sig));

    sendResponse(sizeof(sig), true);
}

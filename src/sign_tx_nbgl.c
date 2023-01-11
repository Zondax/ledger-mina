#ifdef HAVE_NBGL
#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_tx.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "parse_tx.h"

static tx_t _tx;
static ui_t _ui;

static void sign_transaction(void)
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
            generate_keypair(&kp, _tx.account);
            if (!generate_address(address, sizeof(address), &kp.pub)) {
                THROW(INVALID_PARAMETER);
            }
            if (memcmp(address, _ui.from, sizeof(address)) != 0) {
                THROW(INVALID_PARAMETER);
            }

            // Create random oracle input from transaction
            roinput.fields = _tx.input_fields;
            roinput.fields_capacity = ARRAY_LEN(_tx.input_fields);
            roinput.bits = _tx.input_bits;
            roinput.bits_capacity = ARRAY_LEN(_tx.input_bits);
            transaction_to_roinput(&roinput, &_tx.tx);

            if (!sign(&sig, &kp, &roinput, _tx.network_id)) {
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


void ui_sign_tx(uint8_t *dataBuffer, uint8_t dataLength)
{
    if (!parse_tx(dataBuffer, dataLength, &_tx, &_ui)) {
        THROW(INVALID_PARAMETER);
    }

}
#endif // HAVE_NBGL

#include "get_address.h"
#include "utils.h"
#include "crypto.h"

void handle_get_address(uint8_t p1, uint8_t p2, uint8_t *dataBuffer,
                        uint8_t dataLength, volatile unsigned int *flags)
{
    UNUSED(p1);
    UNUSED(p2);

    if (dataLength != 4) {
        THROW(INVALID_PARAMETER);
    }

    ui_get_address(dataBuffer);

    *flags |= IO_ASYNCH_REPLY;
}

void gen_address(uint32_t account, char* address)
{
    BEGIN_TRY {
        Keypair kp;
        TRY {
            generate_keypair(&kp, account);
            if (!generate_address(address, MINA_ADDRESS_LEN, &kp.pub)) {
                THROW(INVALID_PARAMETER);
            }

#ifdef HAVE_ON_DEVICE_UNIT_TESTS
            sendResponse(set_result_get_address(), true);
#endif
        }
        FINALLY {
            explicit_bzero(kp.priv, sizeof(kp.priv));
        }
        END_TRY;
    }
}


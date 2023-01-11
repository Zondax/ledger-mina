#ifdef HAVE_NBGL
#include "get_address.h"
#include "utils.h"
#include "crypto.h"

static bool     _generated;
static uint32_t _account = 0;
static char     _bip44_path[27]; // max length when 44'/12586'/4294967295'/0/0
static char     _address[MINA_ADDRESS_LEN];


static uint8_t set_result_get_address(void)
{
    uint8_t tx = 0;
    memmove(G_io_apdu_buffer + tx, _address, sizeof(_address));
    tx += sizeof(_address);
    return tx;
}

static void gen_address(void)
{
    if (!_generated) {
        BEGIN_TRY {
            Keypair kp;
            TRY {
                generate_keypair(&kp, _account);
                if (!generate_address(_address, sizeof(_address), &kp.pub)) {
                    THROW(INVALID_PARAMETER);
                }
                _generated = true;

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
}

void ui_get_address(uint8_t *dataBuffer) {
    _generated = false;
    _address[0] = '\0';
    _account = read_uint32_be(dataBuffer);

    strncpy(_bip44_path, "44'/12586'/", sizeof(_bip44_path));              // used 11/27 (not counting null-byte)
    value_to_string(&_bip44_path[11], sizeof(_bip44_path) - 11, _account); // at most 21/27 used (max strnlen is 10 when _account = 4294967295)
    strncat(_bip44_path, "'/0/0", 6);                                      // at least 27 - 21 = 6 bytes free (just enough)

    #ifdef HAVE_ON_DEVICE_UNIT_TESTS
       //ux_flow_init(0, ux_get_address_unit_test_flow, NULL);
    #else
        //ux_flow_init(0, ux_get_address_flow, NULL);
    #endif
}

#endif // HAVE_NBGL

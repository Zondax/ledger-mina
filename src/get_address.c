#include "get_address.h"
#include "utils.h"
#include "crypto.h"

static uint32_t _account = 0;
char     _bip44_path[27]; // max length when 44'/12586'/4294967295'/0/0
char     _address[MINA_ADDRESS_LEN];


static void compute_address_and_response() {
    compute_address();
    sendResponse(set_result_get_address(), true);
}

void handle_get_address(uint8_t p1, uint8_t p2, uint8_t *dataBuffer,
                        uint8_t dataLength, volatile unsigned int *flags)
{
    UNUSED(p2);

    if (dataLength != 4) {
        THROW(INVALID_PARAMETER);
    }

    if (p1 > 1) {
        THROW(INVALID_PARAMETER);
    }

    _account = read_uint32_be(dataBuffer);
    uint8_t showAddress = p1 == 0;
    if (showAddress) {
        show_address_and_response();
        *flags |= IO_ASYNCH_REPLY;
    } else {
        compute_address_and_response();
    }
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

uint8_t set_result_get_address()
{
    uint8_t tx = 0;
    memmove(G_io_apdu_buffer + tx, _address, sizeof(_address));
    tx += sizeof(_address);
    return tx;
}

void compute_address() {
    _address[0] = '\0';

    strncpy(_bip44_path, "44'/12586'/", sizeof(_bip44_path));              // used 11/27 (not counting null-byte)
    value_to_string(&_bip44_path[11], sizeof(_bip44_path) - 11, _account); // at most 21/27 used (max strnlen is 10 when _account = 4294967295)
    strncat(_bip44_path, "'/0/0", 6);                                      // at least 27 - 21 = 6 bytes free (just enough)

    gen_address(_account, _address);
}

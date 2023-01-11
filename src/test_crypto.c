#include "globals.h"
#include "curve_checks.h"

uint8_t set_result_test_crypto(void)
{
    uint8_t tx = 0;
    memmove(G_io_apdu_buffer + tx, "Success", 8);
    tx += 8;
    return tx;
}

void test_crypto(void)
{
    if (!curve_checks()) {
        THROW(INVALID_PARAMETER);
    }
    sendResponse(set_result_test_crypto(), true);
#ifdef HAVE_NBGL
    ui_idle();
#endif
}

void handle_test_crypto(uint8_t p1, uint8_t p2, uint8_t *dataBuffer,
                        uint8_t dataLength, volatile unsigned int *flags)
{
    UNUSED(p1);
    UNUSED(p2);
    UNUSED(dataBuffer);

    if (dataLength != 0) {
        THROW(INVALID_PARAMETER);
    }

    ui_test_crypto(dataBuffer);
    *flags |= IO_ASYNCH_REPLY;
}

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

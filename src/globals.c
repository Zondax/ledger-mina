#include "globals.h"
#include "menu.h"

// display stepped screens
unsigned int ux_step;
unsigned int ux_step_count;
const internalStorage_t N_storage_real;

void sendResponse(uint8_t tx, bool approve) {
    G_io_apdu_buffer[tx++] = approve? 0x90 : 0x69;
    G_io_apdu_buffer[tx++] = approve? 0x00 : 0x85;
    // Send back the response, do not restart the event loop
    io_exchange(CHANNEL_APDU | IO_RETURN_AFTER_TX, tx);
    // Display back the original UX
#ifdef HAVE_BAGL
    ui_idle();
#endif
}

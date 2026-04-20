#include "menu.h"

bool is_blindsign_enabled(void) {
    return N_storage.blindsign_enabled == 0x01;
}

void toggle_blindsign(void) {
    uint8_t value = N_storage.blindsign_enabled ? 0x00 : 0x01;
    nvm_write((void*)&N_storage.blindsign_enabled, &value, sizeof(value));
}

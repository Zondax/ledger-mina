#pragma once

#include "globals.h"
#include "glyphs.h"

// The Ledger guidelines cap an app glyph at 48x48 on Apex, while Stax and Flex
// take 64x64, so the logo ships in both sizes and each target picks one.
#ifdef TARGET_APEX_P
    #define MINA_APP_GLYPH C_Mina_48px
#else
    #define MINA_APP_GLYPH C_Mina_64px
#endif

void ui_idle(void);

bool is_blindsign_enabled(void);
void toggle_blindsign(void);

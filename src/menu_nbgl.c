#ifdef HAVE_NBGL
#include "menu.h"
#include "nbgl_use_case.h"

#ifndef PRODUCTION_BUILD
#define PRODUCTION_BUILD 0
#endif

#define SETTING_INFO_NB 3
static const char* const infoTypes[SETTING_INFO_NB] = {"Version", "Developer", "Copyright"};
static const char* const infoContents[SETTING_INFO_NB] = {APPVERSION, "Zondax AG", "(c) 2025 Ledger"};

static const nbgl_contentInfoList_t infoList = {
    .nbInfos = SETTING_INFO_NB,
    .infoTypes = infoTypes,
    .infoContents = infoContents,
};

bool is_blindsign_enabled(void) {
    return N_storage.blindsign_enabled == 0x01;
}

void toggle_blindsign(void) {
    uint8_t value = N_storage.blindsign_enabled ? 0x00 : 0x01;
    nvm_write((void*)&N_storage.blindsign_enabled, &value, sizeof(value));
}

enum {
    BLIND_SIGNING_TOKEN = FIRST_USER_TOKEN,
};

static nbgl_contentSwitch_t switches[1];

static void controls_callback(int token, uint8_t index, int page) {
    UNUSED(index);
    UNUSED(page);
    if (token == BLIND_SIGNING_TOKEN) {
        toggle_blindsign();
        switches[0].initState = is_blindsign_enabled() ? ON_STATE : OFF_STATE;
    }
}

static const nbgl_content_t settingsContentsList = {
    .content.switchesList.nbSwitches = 1,
    .content.switchesList.switches = switches,
    .type = SWITCHES_LIST,
    .contentActionCallback = controls_callback,
};

static const nbgl_genericContents_t settingsContents = {
    .callbackCallNeeded = false,
    .contentsList = &settingsContentsList,
    .nbContents = 1,
};

static void app_quit(void) {
    os_sched_exit(-1);
}

static void init_settings(void) {
    switches[0].text = "Blind signing";
    switches[0].subText = "Enable transaction blind signing";
    switches[0].token = BLIND_SIGNING_TOKEN;
    switches[0].tuneId = TUNE_TAP_CASUAL;
    switches[0].initState = is_blindsign_enabled() ? ON_STATE : OFF_STATE;
}

void ui_idle(void) {
    init_settings();
#ifdef HAVE_ON_DEVICE_UNIT_TESTS
    nbgl_useCaseHomeAndSettings("Mina unit tests",
                                &C_Mina_64px,
                                NULL,
                                INIT_HOME_PAGE,
                                &settingsContents,
                                &infoList,
                                NULL,
                                app_quit);
#elif (PRODUCTION_BUILD == 0)
    nbgl_useCaseHomeAndSettings("Mina DEMO",
                                &C_Mina_64px,
                                "DO NOT USE",
                                INIT_HOME_PAGE,
                                &settingsContents,
                                &infoList,
                                NULL,
                                app_quit);
#else
    nbgl_useCaseHomeAndSettings(APPNAME,
                                &C_Mina_64px,
                                NULL,
                                INIT_HOME_PAGE,
                                &settingsContents,
                                &infoList,
                                NULL,
                                app_quit);
#endif // HAVE_ON_DEVICE_UNIT_TESTS
}
#endif // HAVE_NBGL

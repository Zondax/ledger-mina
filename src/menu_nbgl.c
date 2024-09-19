#ifdef HAVE_NBGL
#include "menu.h"
#include "nbgl_use_case.h"

#define SETTING_INFO_NB 3
static const char* const infoTypes[SETTING_INFO_NB] = {"Version", "Developer", "Copyright"};
static const char* const infoContents[SETTING_INFO_NB] = {APPVERSION, "Jspada", "(c) 2024 Ledger"};

static const nbgl_contentInfoList_t infoList = {
    .nbInfos = SETTING_INFO_NB,
    .infoTypes = infoTypes,
    .infoContents = infoContents,
};

static void app_quit(void) {
    os_sched_exit(-1);
}

void ui_idle(void) {
#ifdef HAVE_ON_DEVICE_UNIT_TESTS
    nbgl_useCaseHomeAndSettings("Mina unit tests",
                                &C_Mina_64px,
                                NULL,
                                INIT_HOME_PAGE,
                                NULL,
                                &infoList,
                                NULL,
                                app_quit);
#else // app_quit
    nbgl_useCaseHomeAndSettings(APPNAME,
                                &C_Mina_64px,
                                NULL,
                                INIT_HOME_PAGE,
                                NULL,
                                &infoList,
                                NULL,
                                app_quit);
#endif // HAVE_ON_DEVICE_UNIT_TESTS
}
#endif // HAVE_NBGL

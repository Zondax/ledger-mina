#ifdef HAVE_NBGL
#include "menu.h"
#include "nbgl_use_case.h"


static const char* const infoTypes[] = {"Version", "Developer", "Copyright"};
static const char* const infoContents[] = {APPVERSION, "Jspada", "(c) 2022 Ledger"};

static bool navigation_cb(uint8_t page, nbgl_pageContent_t* content) {
    UNUSED(page);
    content->type = INFOS_LIST;
    content->infosList.nbInfos = 3;
    content->infosList.infoTypes = (const char**) infoTypes;
    content->infosList.infoContents = (const char**) infoContents;
    return true;
}

static void exit(void) {
    os_sched_exit(-1);
}

void ui_menu_about(void) {
    nbgl_useCaseSettings("Mina", 0, 1, false, ui_idle, navigation_cb, NULL);
}

void ui_idle(void) {
#ifdef HAVE_ON_DEVICE_UNIT_TESTS
    nbgl_useCaseHome("Mina unit tests", &C_Mina_64px, NULL, false, ui_menu_about, exit);
#else // HAVE_ON_DEVICE_UNIT_TESTS
    nbgl_useCaseHome("Mina", &C_Mina_64px, NULL, false, ui_menu_about, exit);
#endif // HAVE_ON_DEVICE_UNIT_TESTS
}
#endif // HAVE_NBGL

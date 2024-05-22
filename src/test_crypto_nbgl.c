#ifdef HAVE_NBGL
#include "globals.h"
#include "curve_checks.h"
#include "test_crypto.h"
#include "nbgl_use_case.h"
#include "menu.h"

void ui_test_crypto(uint8_t* dataBuffer)
{
    UNUSED(dataBuffer);

#ifdef HAVE_ON_DEVICE_UNIT_TESTS
    nbgl_useCaseSpinner("Unit Tests ...");
#else 
    nbgl_useCaseSpinner("Testing cryto ...");
#endif
    test_crypto();
}
#endif // HAVE_NBGL

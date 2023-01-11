#ifdef HAVE_BAGL
#include "globals.h"
#include "curve_checks.h"

UX_STEP_NOCB_INIT(
    ux_test_crypto_done_flow_step,
    pb,
    test_crypto(),
    {
       &C_icon_validate_14,
      "Done",
    });

UX_FLOW(ux_test_crypto_done_flow,
        &ux_test_crypto_done_flow_step);

#ifdef HAVE_ON_DEVICE_UNIT_TESTS

UX_STEP_TIMEOUT(
    ux_test_crypto_testing_step,
    pb,
    1,
    ux_test_crypto_done_flow,
    {
      &C_icon_processing,
      "Unit tests...",
    });

UX_FLOW(ux_test_crypto_testing_flow,
        &ux_test_crypto_testing_step);
#else

UX_STEP_TIMEOUT(
    ux_test_crypto_testing_step,
    pb,
    1,
    ux_test_crypto_done_flow,
    {
      &C_icon_processing,
      "Testing crypto...",
    });

UX_FLOW(ux_test_crypto_testing_flow,
        &ux_test_crypto_testing_step);

#endif

void ui_test_crypto(uint8_t* dataBuffer)
{
    UNUSED(dataBuffer);
    ux_flow_init(0, ux_test_crypto_testing_flow, NULL);
}
#endif // HAVE_BAGL

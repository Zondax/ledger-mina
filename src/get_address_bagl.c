#ifdef HAVE_BAGL
#include "get_address.h"
#include "utils.h"
#include "crypto.h"

extern char _bip44_path[27];
extern char _address[MINA_ADDRESS_LEN];

#ifdef HAVE_ON_DEVICE_UNIT_TESTS
    UX_STEP_NOCB(
        ux_get_address_done_flow_step,
        pb,
        {
            &C_icon_validate_14,
            "Done",
        }
    );

    UX_FLOW(
        ux_get_address_done_flow,
        &ux_get_address_done_flow_step
    );

    UX_STEP_TIMEOUT(
        ux_get_address_flow_unit_tests_step,
        pb,
        1,
        ux_get_address_done_flow,
        {
            &C_icon_processing,
            "Unit tests..."
        }
    );

    UX_FLOW(
        ux_get_address_unit_test_flow,
        &ux_get_address_flow_unit_tests_step
    );
#else
    UX_STEP_NOCB(
        ux_get_address_result_flow_address_step,
        bnnn_paging,
        {
            .title = "Address",
            .text = _address,
        }
    );

    UX_STEP_VALID(
        ux_get_address_result_flow_approve_step,
        pb,
        sendResponse(set_result_get_address(), true),
        {
            &C_icon_validate_14,
            "Approve",
        }
    );

    UX_STEP_VALID(
        ux_get_address_result_flow_reject_step,
        pb,
        sendResponse(0, false),
        {
            &C_icon_crossmark,
            "Reject",
        }
    );

    UX_FLOW(
        ux_get_address_result_flow,
        &ux_get_address_result_flow_address_step,
        &ux_get_address_result_flow_approve_step,
        &ux_get_address_result_flow_reject_step
    );

#ifndef HAVE_CRYPTO_TESTS
    UX_STEP_TIMEOUT(
        ux_get_address_comfort_flow_processing_step,
        pb,
        1,
        ux_get_address_result_flow,
        {
            &C_icon_processing,
            "Processing...",
        }
    );

    UX_FLOW(
        ux_get_address_comfort_flow,
        &ux_get_address_comfort_flow_processing_step
    );
#endif

    UX_STEP_NOCB(
        ux_get_address_flow_topic_step,
        pnn,
        {
            &C_icon_eye,
            "Get",
            "Address"
        }
    );

    UX_STEP_NOCB(
        ux_get_address_flow_path_step,
        bnnn_paging,
        {
            .title = "Path",
            .text = _bip44_path
        }
    );

    UX_STEP_VALID(
        ux_get_address_flow_generate_step,
        pb,
#ifndef HAVE_CRYPTO_TESTS 
        ux_flow_init(0, ux_get_address_comfort_flow, NULL);,

#else
        ux_flow_init(0, ux_get_address_result_flow, NULL);,
#endif
        {
            &C_icon_validate_14,
            "Generate"
        }
    );

    UX_STEP_VALID(
        ux_get_address_flow_cancel_step,
        pb,
        sendResponse(0, false),
        {
            &C_icon_crossmark,
            "Cancel"
        }
    );

    UX_FLOW(
        ux_get_address_flow,
        &ux_get_address_flow_topic_step,
        &ux_get_address_flow_path_step,
        &ux_get_address_flow_generate_step,
        &ux_get_address_flow_cancel_step
    );
#endif

void show_address_and_response(uint32_t account) {
    compute_address(account);

    #ifdef HAVE_ON_DEVICE_UNIT_TESTS
        ux_flow_init(0, ux_get_address_unit_test_flow, NULL);
    #else
        ux_flow_init(0, ux_get_address_flow, NULL);
    #endif
}

#endif // HAVE_BAGL

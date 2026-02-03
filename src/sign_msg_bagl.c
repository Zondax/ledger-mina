#ifdef HAVE_BAGL

#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_msg.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"

struct {
    char msgDataBuf[256];      // For display (may be hex string)
    uint8_t rawDataBuf[256];   // Original bytes for signing
    uint8_t dataBufLength;
} _msgData;

UX_STEP_NOCB_INIT(
    ux_sign_msg_done_flow_done_step,
    pb,
    sign_message(_msgData.rawDataBuf, _msgData.dataBufLength),
    {
        &C_icon_validate_14,
        "Done"
    }
);

UX_FLOW(
    ux_sign_msg_done_flow,
    &ux_sign_msg_done_flow_done_step
);

static poseidon_mode_t _mode;

// Blind signing disabled flow
UX_STEP_NOCB(
    ux_blind_disabled_flow_1_step,
    pnn,
    {
        &C_icon_crossmark,
        "Blind signing",
        "not enabled"
    }
);
UX_STEP_NOCB(
    ux_blind_disabled_flow_2_step,
    nn,
    {
        "Enable it in",
        "app settings"
    }
);
UX_STEP_VALID(
    ux_blind_disabled_flow_reject_step,
    pb,
    sendResponse(0, false),
    {
        &C_icon_crossmark,
        "Reject"
    }
);
UX_FLOW(
    ux_blind_disabled_flow,
    &ux_blind_disabled_flow_1_step,
    &ux_blind_disabled_flow_2_step,
    &ux_blind_disabled_flow_reject_step
);

// Blind signing warning flow
UX_STEP_NOCB(
    ux_blind_warning_flow_1_step,
    pbb,
    {
        &C_icon_warning,
        "Blind",
        "Signing"
    }
);
UX_STEP_NOCB(
    ux_blind_warning_flow_2_step,
    nn,
    {
        "Tx details",
        "not verifiable"
    }
);
UX_STEP_NOCB(
    ux_blind_warning_flow_3_step,
    nn,
    {
        "Could lose",
        "all assets"
    }
);

// Topic steps
UX_STEP_NOCB(
    ux_sign_msg_flow_topic_step,
    pnn,
    {
        &C_icon_eye,
        "Sign",
        "Message"
    }
);

UX_STEP_NOCB(
    ux_sign_field_flow_topic_step,
    pnn,
    {
        &C_icon_eye,
        "Sign",
        "fullCommitment"
    }
);

UX_STEP_NOCB(
    ux_sign_msg_flow_network_step,
    bn,
    {
        "Network",
        "testnet"
    }
);

UX_STEP_NOCB(
    ux_sign_msg_flow_msg_step,
    bn_paging,
    {
        "Message",
        _msgData.msgDataBuf
    }
);

UX_STEP_VALID(
    ux_sign_msg_flow_approve_step,
    pb,

    ux_flow_init(0, ux_sign_msg_done_flow, NULL);,
    {
        &C_icon_validate_14,
        "Approve"
    }
);

// Accept risk step for blind signing
UX_STEP_VALID(
    ux_sign_field_flow_accept_step,
    pnn,

    ux_flow_init(0, ux_sign_msg_done_flow, NULL);,
    {
        &C_icon_validate_14,
        "ACCEPT RISK",
        "AND APPROVE"
    }
);

UX_STEP_VALID(
    ux_sign_msg_flow_reject_step,
    pb,
    sendResponse(0, false),
    {
        &C_icon_crossmark,
        "Reject"
    }
);

// Field element step (displays as "fullCommitment" instead of "Message")
UX_STEP_NOCB(
    ux_sign_field_flow_field_step,
    bn_paging,
    {
        "fullCommitment",
        _msgData.msgDataBuf
    }
);

// Message flows
UX_FLOW(ux_sign_msg_flow,
        &ux_sign_msg_flow_topic_step,
        &ux_sign_msg_flow_msg_step,
        &ux_sign_msg_flow_approve_step,
        &ux_sign_msg_flow_reject_step);

UX_FLOW(ux_sign_msg_flow_testnet,
        &ux_sign_msg_flow_topic_step,
        &ux_sign_msg_flow_network_step,
        &ux_sign_msg_flow_msg_step,
        &ux_sign_msg_flow_approve_step,
        &ux_sign_msg_flow_reject_step);

// Field element flows with blind signing warning
UX_FLOW(ux_sign_field_flow,
        &ux_blind_warning_flow_1_step,
        &ux_blind_warning_flow_2_step,
        &ux_blind_warning_flow_3_step,
        &ux_sign_field_flow_topic_step,
        &ux_sign_field_flow_field_step,
        &ux_sign_field_flow_accept_step,
        &ux_sign_msg_flow_reject_step);

UX_FLOW(ux_sign_field_flow_testnet,
        &ux_blind_warning_flow_1_step,
        &ux_blind_warning_flow_2_step,
        &ux_blind_warning_flow_3_step,
        &ux_sign_field_flow_topic_step,
        &ux_sign_msg_flow_network_step,
        &ux_sign_field_flow_field_step,
        &ux_sign_field_flow_accept_step,
        &ux_sign_msg_flow_reject_step);


#define GET_FLOW_PTR(x) ((const ux_flow_step_t** const )&x)

void ui_sign_msg_blind_disabled(void)
{
    ux_flow_init(0, GET_FLOW_PTR(ux_blind_disabled_flow), NULL);
}

void ui_sign_msg(uint8_t *dataBuffer, uint8_t dataLength, uint8_t net_id, poseidon_mode_t mode)
{
    if (dataBuffer == NULL) {
        THROW(INVALID_PARAMETER);
    }

    memset(_msgData.msgDataBuf, 0, sizeof(_msgData.msgDataBuf));
    memset(_msgData.rawDataBuf, 0, sizeof(_msgData.rawDataBuf));
    _msgData.dataBufLength = dataLength;
    _mode = mode;

    // Always store raw bytes for signing
    memcpy(_msgData.rawDataBuf, dataBuffer, dataLength);

    if (mode == POSEIDON_KIMCHI) {
        bytes_to_hex_display(_msgData.msgDataBuf, sizeof(_msgData.msgDataBuf), dataBuffer, dataLength);
    } else {
        memcpy(_msgData.msgDataBuf, (char *) dataBuffer, dataLength);
    }

    if (mode == POSEIDON_KIMCHI) {
        // Field element signing with blind signing warning
        if (net_id == MAINNET_ID) {
            ux_flow_init(0, GET_FLOW_PTR(ux_sign_field_flow), NULL);
        } else {
            ux_flow_init(0, GET_FLOW_PTR(ux_sign_field_flow_testnet), NULL);
        }
    } else {
        // Legacy message signing
        if (net_id == MAINNET_ID) {
            ux_flow_init(0, GET_FLOW_PTR(ux_sign_msg_flow), NULL);
        } else {
            ux_flow_init(0, GET_FLOW_PTR(ux_sign_msg_flow_testnet), NULL);
        }
    }
}

#endif // HAVE_BAGL

#ifdef HAVE_BAGL

#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_zk_field.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"

struct {
    char fieldDataBuf[256];
    uint8_t dataBufLength;
} _fieldData;

UX_STEP_NOCB_INIT(
    ux_sign_field_done_flow_done_step,
    pb,
    sign_zkapp_field((uint8_t *) _fieldData.fieldDataBuf, _fieldData.dataBufLength),
    {
        &C_icon_validate_14,
        "Done"
    }
);

UX_FLOW(
    ux_sign_field_done_flow,
    &ux_sign_field_done_flow_done_step
);

UX_STEP_NOCB(
    ux_sign_field_flow_topic_step,
    pnn,
    {
        &C_icon_eye,
        "Sign",
        "Field"
    }
);

UX_STEP_NOCB(
    ux_sign_field_flow_network_step,
    bn,
    {
        "Network",
        "testnet"
    }
);

UX_STEP_NOCB(
    ux_sign_field_flow_field_step,
    bn_paging,
    {
        "Field",
        _fieldData.fieldDataBuf
    }
);

UX_STEP_VALID(
    ux_sign_field_flow_approve_step,
    pb,

    ux_flow_init(0, ux_sign_field_done_flow, NULL);,
    {
        &C_icon_validate_14,
        "Approve"
    }
);

UX_STEP_VALID(
    ux_sign_field_flow_reject_step,
    pb,
    sendResponse(0, false),
    {
        &C_icon_crossmark,
        "Reject"
    }
);

UX_FLOW(ux_sign_field_flow,
        &ux_sign_field_flow_topic_step,
        &ux_sign_field_flow_field_step,
        &ux_sign_field_flow_approve_step,
        &ux_sign_field_flow_reject_step);

UX_FLOW(ux_sign_field_flow_testnet,
        &ux_sign_field_flow_topic_step,
        &ux_sign_field_flow_network_step,
        &ux_sign_field_flow_field_step,
        &ux_sign_field_flow_approve_step,
        &ux_sign_field_flow_reject_step);


#define GET_FLOW_PTR(x) ((const ux_flow_step_t** const )&x)

void ui_sign_zkapp_field(uint8_t *dataBuffer, uint8_t dataLength, uint8_t net_id)
{
    if (dataBuffer == NULL) {
        THROW(INVALID_PARAMETER);
    }

    memset(_fieldData.fieldDataBuf, 0, sizeof(_fieldData.fieldDataBuf));
    _fieldData.dataBufLength = dataLength;
    memcpy(_fieldData.fieldDataBuf, (char *) dataBuffer, _fieldData.dataBufLength);

    if (net_id == MAINNET_ID) {
        ux_flow_init(0, GET_FLOW_PTR(ux_sign_field_flow), NULL);
    } else {
        ux_flow_init(0, GET_FLOW_PTR(ux_sign_field_flow_testnet), NULL);
    }
}

#endif // HAVE_BAGL

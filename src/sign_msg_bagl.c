#ifdef HAVE_BAGL

#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_msg.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"

static char _msg[256];

UX_STEP_NOCB_INIT(
    ux_sign_msg_done_flow_done_step,
    pb,
    sign_message((uint8_t *) _msg, strlen(_msg)),
    {
        &C_icon_validate_14,
        "Done"
    }
);

UX_FLOW(
    ux_sign_msg_done_flow,
    &ux_sign_msg_done_flow_done_step
);

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
    ux_sign_msg_flow_network_step,
    bn,
    {
        "Network",
        "testnet"
    }
);

UX_STEP_NOCB(
    ux_sign_msg_flow_msg_step,
    bn,
    {
        "Message",
        _msg
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

UX_STEP_VALID(
    ux_sign_msg_flow_reject_step,
    pb,
    sendResponse(0, false),
    {
        &C_icon_crossmark,
        "Reject"
    }
);

UX_FLOW(ux_sign_msg_flow,
        &ux_sign_msg_flow_topic_step,
        &ux_sign_msg_flow_network_step,
        &ux_sign_msg_flow_msg_step,
        &ux_sign_msg_flow_approve_step,
        &ux_sign_msg_flow_reject_step);


#define GET_FLOW_PTR(x) ((const ux_flow_step_t** const )&x)

void ui_sign_msg(uint8_t *dataBuffer, uint8_t dataLength)
{
    strncpy(_msg, (char *) dataBuffer + MSG_OFFSET, dataLength - MSG_OFFSET);
    ux_flow_init(0, GET_FLOW_PTR(ux_sign_msg_flow), NULL);
}

#endif // HAVE_BAGL
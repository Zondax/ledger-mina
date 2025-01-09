#ifdef HAVE_NBGL
#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_msg.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "parse_tx.h"
#include "nbgl_use_case.h"

#define MAX_ELEM_CNT 5

static char _msg[256];
static uint8_t _netId;

typedef struct 
{
    nbgl_layoutTagValue_t tagValuePair[MAX_ELEM_CNT];
    nbgl_layoutTagValueList_t tagValueList;
} MessageContext_t;

static MessageContext_t messageContext;

static void review_choice(bool confirm) 
{
    if (confirm) 
    {
        nbgl_useCaseSpinner("Processing");
        sign_message((uint8_t *) _msg, strlen(_msg));
        nbgl_useCaseReviewStatus(STATUS_TYPE_TRANSACTION_SIGNED, ui_idle);
    }
    else 
    {
        sendResponse(0, false);
        nbgl_useCaseReviewStatus(STATUS_TYPE_TRANSACTION_REJECTED, ui_idle);
    }
}

static void prepare_msg_context(void) {
    uint8_t nbPairs = 0;

    if (_netId != MAINNET_ID) 
    {
        messageContext.tagValuePair[nbPairs].item = "Network";
        messageContext.tagValuePair[nbPairs].value = "Testnet";
        nbPairs++;
    }


    messageContext.tagValuePair[nbPairs].item = "Message";
    messageContext.tagValuePair[nbPairs].value = _msg;
    nbPairs++;

    messageContext.tagValueList.pairs = messageContext.tagValuePair;
    messageContext.tagValueList.nbPairs = nbPairs;
}

void ui_sign_msg(uint8_t *dataBuffer, uint8_t dataLength)
{
    strncpy(_msg, (char *) dataBuffer + MSG_OFFSET, dataLength - MSG_OFFSET);

    prepare_msg_context();
    nbgl_useCaseReview(TYPE_TRANSACTION,
                        &messageContext.tagValueList,
                        &C_Mina_64px,
                        "Review message",
                        NULL,
                        "Sign message",
                        review_choice);
}
#endif // HAVE_NBGL

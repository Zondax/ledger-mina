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

struct {
    char msgDataBuf[256];      // For display (may be hex string)
    uint8_t rawDataBuf[256];   // Original bytes for signing
    uint8_t dataBufLength;
} _msgData;
static uint8_t _netId;
static poseidon_mode_t _mode;

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
        sign_message(_msgData.rawDataBuf, _msgData.dataBufLength),
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

    if (_mode == POSEIDON_KIMCHI) {
        messageContext.tagValuePair[nbPairs].item = "fullCommitment";
    } else {
        messageContext.tagValuePair[nbPairs].item = "Message";
    }
    messageContext.tagValuePair[nbPairs].value = _msgData.msgDataBuf;
    nbPairs++;

    messageContext.tagValueList.pairs = messageContext.tagValuePair;
    messageContext.tagValueList.nbPairs = nbPairs;
}

static void blind_disabled_callback(void) {
    sendResponse(0, false);
    ui_idle();
}

void ui_sign_msg_blind_disabled(void) {
    nbgl_useCaseStatus("Blind signing\nnot enabled", false, blind_disabled_callback);
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

    _netId = net_id;

    prepare_msg_context();

    if (mode == POSEIDON_KIMCHI) {
        // Field element signing with blind signing warning
        nbgl_useCaseReviewBlindSigning(TYPE_TRANSACTION | BLIND_OPERATION,
                            &messageContext.tagValueList,
                            &C_Mina_64px,
                            "Review\nfullCommitment",
                            NULL,
                            "Accept risk and\nsign fullCommitment?",
                            NULL,
                            review_choice);
    } else {
        // Legacy message signing
        nbgl_useCaseReview(TYPE_TRANSACTION,
                            &messageContext.tagValueList,
                            &C_Mina_64px,
                            "Review message",
                            NULL,
                            "Sign message",
                            review_choice);
    }
}
#endif // HAVE_NBGL

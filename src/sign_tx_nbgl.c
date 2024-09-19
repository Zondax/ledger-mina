#ifdef HAVE_NBGL
#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_tx.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "parse_tx.h"
#include "nbgl_use_case.h"

#define MAX_ELEM_CNT 10

static tx_t _tx;
static ui_t _ui;

typedef struct 
{
    nbgl_layoutTagValue_t tagValuePair[MAX_ELEM_CNT];
    nbgl_layoutTagValueList_t tagValueList;
} TransactionContext_t;

static TransactionContext_t transactionContext;

static void review_choice(bool confirm) 
{
    if (confirm) 
    {
        nbgl_useCaseSpinner("Processing");
        sign_transaction(&_tx, &_ui);
        nbgl_useCaseReviewStatus(STATUS_TYPE_TRANSACTION_SIGNED, ui_idle);
    }
    else 
    {
        sendResponse(0, false);
        nbgl_useCaseReviewStatus(STATUS_TYPE_TRANSACTION_REJECTED, ui_idle);
    }
}

static void prepare_transaction_context(void) {
    uint8_t nbPairs = 0;

    // Network id
    if (_tx.network_id != MAINNET_ID) 
    {
        transactionContext.tagValuePair[nbPairs].item = "Network";
        transactionContext.tagValuePair[nbPairs].value = "Testnet";
        nbPairs++;
    }

    if (_tx.tag == PAYMENT_TX) 
    {
        // Transaction type
        transactionContext.tagValuePair[nbPairs].item = "Type";
        transactionContext.tagValuePair[nbPairs].value = "Payment";
        nbPairs++;

        // From 
        transactionContext.tagValuePair[nbPairs].item = "From";
        transactionContext.tagValuePair[nbPairs].value = _ui.from;
        nbPairs++;

        // To 
        transactionContext.tagValuePair[nbPairs].item = "To";
        transactionContext.tagValuePair[nbPairs].value = _ui.to;
        nbPairs++;
    }
    else if (_tx.tag == DELEGATION_TX) 
    {
        // Transaction type
        transactionContext.tagValuePair[nbPairs].item = "Type";
        transactionContext.tagValuePair[nbPairs].value = "Delegation";
        nbPairs++;

        // From 
        transactionContext.tagValuePair[nbPairs].item = "Delegator";
        transactionContext.tagValuePair[nbPairs].value = _ui.from;
        nbPairs++;

        // To 
        transactionContext.tagValuePair[nbPairs].item = "Delegate";
        transactionContext.tagValuePair[nbPairs].value = _ui.to;
        nbPairs++;
    }

    // Amount
    transactionContext.tagValuePair[nbPairs].item = "Amount";
    transactionContext.tagValuePair[nbPairs].value = _ui.amount;
    nbPairs++;

    // Fee
    transactionContext.tagValuePair[nbPairs].item = "Fee";
    transactionContext.tagValuePair[nbPairs].value = _ui.fee;
    nbPairs++;

    if (_tx.tag == PAYMENT_TX) 
    {
        // Total
        transactionContext.tagValuePair[nbPairs].item = "Total";
        transactionContext.tagValuePair[nbPairs].value = _ui.total;
        nbPairs++;
    }

    // Nonce
    transactionContext.tagValuePair[nbPairs].item = "Nonce";
    transactionContext.tagValuePair[nbPairs].value = _ui.nonce;
    nbPairs++;

    if (_tx.tx.valid_until) 
    {
        // Valid until
        transactionContext.tagValuePair[nbPairs].item = "Valid until";
        transactionContext.tagValuePair[nbPairs].value = _ui.valid_until;
        nbPairs++;
    }

    if (_ui.memo[0] != '\0') 
    {
        // Memo
        transactionContext.tagValuePair[nbPairs].item = "Memo";
        transactionContext.tagValuePair[nbPairs].value = _ui.memo;
        nbPairs++;
    }

    transactionContext.tagValueList.pairs = transactionContext.tagValuePair;
    transactionContext.tagValueList.nbPairs = nbPairs;
}

void ui_sign_tx(uint8_t *dataBuffer, uint8_t dataLength)
{
    if (!parse_tx(dataBuffer, dataLength, &_tx, &_ui)) {
        THROW(INVALID_PARAMETER);
    }

    #ifdef HAVE_ON_DEVICE_UNIT_TESTS
        nbgl_useCaseSpinner("Unit Tests ...");
        sign_transaction();
        nbgl_useCaseReviewStatus(STATUS_TYPE_TRANSACTION_SIGNED, ui_idle);
    #else
        prepare_transaction_context();
        // Start review
        nbgl_useCaseReview(TYPE_TRANSACTION,
                           &transactionContext.tagValueList,
                           &C_Mina_64px,
                           "Review transaction",
                           NULL,
                           "Sign transaction",
                           review_choice);
    #endif
}
#endif // HAVE_NBGL

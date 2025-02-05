#ifdef HAVE_NBGL
#include "get_address.h"
#include "utils.h"
#include "crypto.h"
#include "menu.h"
#include "nbgl_use_case.h"

extern char _bip44_path[27];
extern char _address[MINA_ADDRESS_LEN];

typedef struct {
    nbgl_layoutTagValue_t tagValuePair[3];
    nbgl_layoutTagValueList_t tagValueList;
    nbgl_pageInfoLongPress_t infoLongPress;
} TransactionContext_t;

static TransactionContext_t transactionContext;

static void confirmation_callback(bool confirm) {
    if (confirm) {
        sendResponse(set_result_get_address(), true),
        nbgl_useCaseReviewStatus(STATUS_TYPE_ADDRESS_VERIFIED, ui_idle);
    }
    else {
        sendResponse(0, false);
        nbgl_useCaseReviewStatus(STATUS_TYPE_ADDRESS_REJECTED, ui_idle);
    }
}

void show_address_and_response() {
    compute_address();

    transactionContext.tagValuePair[0].item = "Path";
    transactionContext.tagValuePair[0].value = _bip44_path;

    transactionContext.tagValueList.nbPairs = 1;
    transactionContext.tagValueList.pairs = transactionContext.tagValuePair;

    #ifdef HAVE_ON_DEVICE_UNIT_TESTS
        nbgl_useCaseSpinner("Unit tests ...");
    #else
        nbgl_useCaseAddressReview(_address,
                                  &transactionContext.tagValueList,
                                  &C_Mina_64px,
                                  "Verify Mina address",
                                  NULL,
                                  confirmation_callback);
    #endif


}

#endif // HAVE_NBGL

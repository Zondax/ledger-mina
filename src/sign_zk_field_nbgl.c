#ifdef HAVE_NBGL
#include <assert.h>
#include <stdlib.h>

#include "menu.h"
#include "sign_zk_field.h"
#include "utils.h"
#include "crypto.h"
#include "random_oracle_input.h"
#include "parse_tx.h"
#include "nbgl_use_case.h"

#define MAX_ELEM_CNT 5

struct {
    char fieldDataBuf[256];
    uint8_t dataBufLength;
} _fieldData;
static uint8_t _netId;

typedef struct 
{
    nbgl_layoutTagValue_t tagValuePair[MAX_ELEM_CNT];
    nbgl_layoutTagValueList_t tagValueList;
} FieldContext_t;

static FieldContext_t fieldContext;

static void review_choice(bool confirm) 
{
    if (confirm) 
    {
        nbgl_useCaseSpinner("Processing");
        sign_zkapp_field((uint8_t *) _fieldData.fieldDataBuf, _fieldData.dataBufLength),
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
        fieldContext.tagValuePair[nbPairs].item = "Network";
        fieldContext.tagValuePair[nbPairs].value = "Testnet";
        nbPairs++;
    }


    fieldContext.tagValuePair[nbPairs].item = "Field";
    fieldContext.tagValuePair[nbPairs].value = _fieldData.fieldDataBuf;
    nbPairs++;

    fieldContext.tagValueList.pairs = fieldContext.tagValuePair;
    fieldContext.tagValueList.nbPairs = nbPairs;
}

void convert_hex_to_decimal_string(uint8_t *dataBuffer, uint8_t dataLength, char *output) {
    uint64_t value = 0;
    
    // Convert hex bytes to uint64_t
    for (int i = 0; i < dataLength; i++) {
        value = (value << 8) | dataBuffer[i];
    }
    
    // Convert to decimal string, starting from the end
    if (value == 0) {
        output[0] = '0';
        output[1] = '\0';
        return;
    }
    
    int idx = 0;
    while (value > 0) {
        uint64_t remainder = value % 10;
        output[idx++] = '0' + remainder;
        value = value / 10;
    }
    
    // Reverse the string
    int start = 0;
    int end = idx - 1;
    while (start < end) {
        char temp = output[start];
        output[start] = output[end];
        output[end] = temp;
        start++;
        end--;
    }
    output[idx] = '\0';
}

void ui_sign_zkapp_field(uint8_t *dataBuffer, uint8_t dataLength, uint8_t net_id)
{
    if (dataBuffer == NULL) {
        THROW(INVALID_PARAMETER);
    }

    memset(_fieldData.fieldDataBuf, 0, sizeof(_fieldData.fieldDataBuf));
    // _fieldData.dataBufLength = dataLength;

    // memcpy(_fieldData.fieldDataBuf, (char *) dataBuffer, _fieldData.dataBufLength);
    convert_hex_to_decimal_string(dataBuffer, dataLength, _fieldData.fieldDataBuf);
    _fieldData.dataBufLength = strlen(_fieldData.fieldDataBuf);
    _netId = net_id;

    prepare_msg_context();
    nbgl_useCaseReview(TYPE_TRANSACTION,
                        &fieldContext.tagValueList,
                        &C_Mina_64px,
                        "Review field",
                        NULL,
                        "Sign field",
                        review_choice);
}
#endif // HAVE_NBGL

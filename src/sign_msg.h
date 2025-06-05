#pragma once
#include "globals.h"

#define ACCOUNT_LENGTH 4
#define NETWORK_LENGTH 1

#define ACCOUNT_OFFSET 0
#define NETWORK_OFFSET 4
#define MSG_OFFSET 5

void handle_sign_msg(uint8_t p1, uint8_t p2, uint8_t *dataBuffer,
                    uint8_t dataLength, volatile unsigned int *flags);

void ui_sign_msg(uint8_t* dataBuffer, uint8_t dataLength, uint8_t net_id);

void sign_message(uint8_t *dataBuffer, uint8_t dataLength);

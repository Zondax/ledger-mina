#pragma once

#include "globals.h"

uint8_t set_result_get_address();

void compute_address();

void show_address_and_response();

void handle_get_address(uint8_t p1, uint8_t p2, uint8_t *dataBuffer,
                        uint8_t dataLength, volatile unsigned int *flags);

void gen_address(uint32_t account, char* address);

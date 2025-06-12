#include <stdbool.h>
#include <memory.h>
#include <stdio.h> // REMOVE

#include "utils.h"
#include "crypto.h"

#ifdef LEDGER_BUILD
    #include <os.h>
#endif

static const char TICKER_WITH_SPACE[] = "MINA ";
static const char B58_ALPHABET[] = {
    '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
};

// >= 0 : OK
// -2   : EXCEPTION_OVERFLOW
// -1   : INVALID_PARAMETER
int b58_encode(const unsigned char *in, unsigned char length,
               unsigned char *out, const unsigned char maxoutlen)
{
    unsigned char tmp[164];
    unsigned char buffer[164];
    unsigned char j;
    unsigned char startAt;
    unsigned char zeroCount = 0;
    if (length > sizeof(tmp)) {
        // Input buffer too big
        return -1;
    }
    if (length > (sizeof(buffer) / 2)) {
        return -1;
    }
    memcpy(tmp, in, length);
    while ((zeroCount < length) && (tmp[zeroCount] == 0)) {
        ++zeroCount;
    }
    j = 2 * length;
    startAt = zeroCount;
    while (startAt < length) {
        unsigned short remainder = 0;
        unsigned char divLoop;
        for (divLoop = startAt; divLoop < length; divLoop++) {
            unsigned short digit256 = (unsigned short)(tmp[divLoop] & 0xff);
            unsigned short tmpDiv = remainder * 256 + digit256;
            tmp[divLoop] = (unsigned char)(tmpDiv / 58);
            remainder = (tmpDiv % 58);
        }
        if (tmp[startAt] == 0) {
            ++startAt;
        }
        buffer[--j] = (unsigned char)B58_ALPHABET[remainder];
    }
    while ((j < (2 * length)) && (buffer[j] == B58_ALPHABET[0])) {
        ++j;
    }
    while (zeroCount-- > 0) {
        buffer[--j] = B58_ALPHABET[0];
    }
    length = 2 * length - j;
    if (maxoutlen < length) {
        // Output buffer too small
        return -1;
    }
    memcpy(out, (buffer + j), length);
    return length;
}

/*
 * Copyright 2012-2014 Luke Dashjr
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the standard MIT license.  See COPYING for more details.
 */

/**
 * Maximum length of input when decoding in base 58.
 */
#define MAX_DEC_INPUT_SIZE 164

// Use the SDK's version
#define BASE58_TABLE_SIZE 128
extern uint8_t const BASE58_TABLE[BASE58_TABLE_SIZE];

int b58_decode(const char *in, size_t in_len, uint8_t *out, size_t out_len) {
    uint8_t tmp[MAX_DEC_INPUT_SIZE] = {0};
    uint8_t buffer[MAX_DEC_INPUT_SIZE] = {0};
    uint8_t j;
    uint8_t start_at;
    uint8_t zero_count = 0;

    if (in_len > MAX_DEC_INPUT_SIZE || in_len < 2) {
        return -1;
    }

    memmove(tmp, in, in_len);

    for (uint8_t i = 0; i < in_len; i++) {
        if (in[i] >= sizeof(BASE58_TABLE)) {
            return -1;
        }

        tmp[i] = BASE58_TABLE[(int) in[i]];

        if (tmp[i] == 0xFF) {
            return -1;
        }
    }

    while ((zero_count < in_len) && (tmp[zero_count] == 0)) {
        ++zero_count;
    }

    j = in_len;
    start_at = zero_count;
    while (start_at < in_len) {
        uint16_t remainder = 0;
        for (uint8_t div_loop = start_at; div_loop < in_len; div_loop++) {
            uint16_t digit256 = (uint16_t)(tmp[div_loop] & 0xFF);
            uint16_t tmp_div = remainder * 58 + digit256;
            tmp[div_loop] = (uint8_t)(tmp_div / 256);
            remainder = tmp_div % 256;
        }

        if (tmp[start_at] == 0) {
            ++start_at;
        }

        buffer[--j] = (uint8_t) remainder;
    }

    while ((j < in_len) && (buffer[j] == 0)) {
        ++j;
    }

    int length = in_len - (j - zero_count);

    if ((int) out_len < length) {
        return -1;
    }

    memmove(out, buffer + j - zero_count, length);

    return length;
}

uint32_t read_uint32_be(const uint8_t *buffer)
{
  return (buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | (buffer[3]);
}

uint64_t read_uint64_be(const uint8_t *buffer)
{
    return ((uint64_t)buffer[0] << 56) | ((uint64_t)buffer[1] << 48) |
            ((uint64_t)buffer[2] << 40) | ((uint64_t)buffer[3] << 32) |
           ((uint64_t)buffer[4] << 24) | ((uint64_t)buffer[5] << 16) |
            ((uint64_t)buffer[6] << 8) | ((uint64_t)buffer[7]);
}

char *amount_to_string(char *buf, const size_t len, uint64_t amount)
{
    // COIN is 1.000 000 000;
    size_t mantissa_len = 1;
    for (uint64_t value = amount, _len = 9; value && _len > 0; value /= 10, _len--) {
        if (value % 10 != 0) {
            mantissa_len = _len;
            break;
        }
    }

    // don't use log10() on ledger
    size_t characteristic_len = 0;
    for (uint64_t value = amount/COIN; value; value /= 10) {
        characteristic_len++;
    }
    characteristic_len = characteristic_len ? characteristic_len : 1;
    size_t total_len = characteristic_len + 1 + mantissa_len + 1 + strlen(TICKER_WITH_SPACE);
    if (total_len > len) {
        *buf = '\0';
        return buf;
    }

    char *end = buf + total_len - 1;
    *end = '\0';

    int show_digit = 0;
    for (size_t i = 0; amount || i < 11; i++) {
        uint8_t digit = amount % 10;

        if (i == 9) {
            *(--end) = '.';
        }
        else {
            if (i > 7 || (digit != 0 && i < 8) || show_digit) {
                *(--end) = '0' + digit;
                show_digit = 1;
            }

            amount /= 10;
        }
    }

    for (size_t i = strlen(TICKER_WITH_SPACE); i > 0; i--) {
        *(--end) = TICKER_WITH_SPACE[i - 1];
    }

    return buf;
}

char *value_to_string(char *buf, const size_t len, uint64_t value)
{
    // don't use log10() on ledger
    size_t digits = 0;
    for (uint64_t val = value; val; val /= 10) {
        digits++;
    }
    digits = digits ? digits : 1;
    size_t total_len = digits + 1;
    if (total_len > len) {
        return NULL;
    }

    char *end = buf + total_len - 1;
    *end = '\0';

    for (size_t i = 0 ; value || i < 1; i++) {
        uint8_t digit = value % 10;
        *(--end) = '0' + digit;
        value /= 10;
    }

    return buf;
}

void packed_bit_array_set(uint8_t *bits, const size_t i, const bool b)
{
    size_t byte_idx = i / 8;
    size_t in_byte_idx = i % 8;

    if (b) {
        bits[byte_idx] |= (1 << in_byte_idx);
    }
    else {
        bits[byte_idx] &= ~( (uint8_t)(1 << in_byte_idx) );
    }
}

bool packed_bit_array_get(const uint8_t *bits, const size_t i)
{
    size_t byte_idx = i / 8;
    size_t in_byte_idx = i % 8;

    return (bits[byte_idx] >> in_byte_idx) & 1;
}

// Note: does not validate the address
void read_public_key_compressed(Compressed *out, const char *address)
{
    if (strnlen(address, MINA_ADDRESS_LEN) != MINA_ADDRESS_LEN - 1) {
        return;
    }

    uint8_t bytes[40]= {0};
    size_t bytes_len = 40;
    b58_decode(address, MINA_ADDRESS_LEN - 1, bytes, bytes_len);

    struct bytes {
        uint8_t version;
        uint8_t payload[35];
        uint8_t checksum[4];
    } *raw = (struct bytes *)bytes;

    // Extract x-coordinate and swap big endian order
    for (size_t i = 2; i < sizeof(raw->payload) - 1; i++) {
        out->x[FIELD_BYTES - (i - 1)] = raw->payload[i];
    }
    out->is_odd = (bool)raw->payload[34];
}

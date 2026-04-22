// Poseidon - cryptographic hash function for zero-knowledge proof systems
//
//     Details: https://eprint.iacr.org/2019/458
//
//     Poseidon requires the following parameters, with p a prime defining
//     a prime field.
//
//         alpha = smallest prime s.t. gcd(p, alpha) = 1
//         m = number of field elements in the state of the hash function
//         N = number of rounds the hash function performs on each digest
//
//     For m = r + c, the sponge absorbs (via field addition) and
//     squeezes r field elements per iteration, and offers log2(c)
//     bits of security.

#pragma once

#include <stdint.h>
#include <stddef.h>

// Forward declarations - these are defined in crypto.h

// Legacy constants
#define ROUNDS_LEGACY 64
#define FULL_ROUNDS_LEGACY 63

// Kimchi constants
#define ROUNDS_KIMCHI 55
#define FULL_ROUNDS_KIMCHI 55

// Compatibility defines for legacy code
#define ROUNDS ROUNDS_LEGACY
#define FULL_ROUNDS FULL_ROUNDS_LEGACY

#define SPONGE_SIZE 3

// poseidon_mode_t is defined in crypto.h

// Types are defined in crypto.h - no need to redeclare them

typedef Field State[SPONGE_SIZE];

bool poseidon_init(State s, const uint8_t network_id, poseidon_mode_t mode);
void poseidon_update(State s, const Scalar *input, const size_t len, poseidon_mode_t mode);
void poseidon_digest(Scalar out, const State s);

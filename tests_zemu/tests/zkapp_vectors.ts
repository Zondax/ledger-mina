// Test vectors for zkApp field element signing.
//
// Generated using o1js mina-signer's signZkappCommand() and signFieldElement(),
// which were verified to produce matching signatures. The reference code is at:
//   o1js/src/mina-signer/src/sign-zkapp-command.ts
//   o1js/src/mina-signer/src/signature.ts

// Private key for account 0 derived from Zemu test seed
// Matches public key: B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV
export const ZKAPP_PRIVATE_KEY = 'EKDt66ubGg5SDiwcQABWfFZaruq6idcyrLLfyZQjoH4CN3PHEiNj'
export const ZKAPP_PUBLIC_KEY = 'B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV'

// Convert a bigint to 32-byte little-endian Buffer
export function commitmentToBytes(commitment: bigint): Buffer {
  const bytes = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number((commitment >> BigInt(i * 8)) & 0xFFn);
  }
  return bytes;
}

// Empty zkApp command used for the test vectors below.
// fee: 1 MINA, nonce: 0, no account updates, empty memo.
export const EMPTY_ZKAPP_COMMAND = {
  feePayer: {
    body: {
      publicKey: ZKAPP_PUBLIC_KEY,
      fee: "1000000000",
      nonce: "0",
      validUntil: null,
    },
    authorization: "",
  },
  accountUpdates: [],
  memo: "E4YM2vTHhWEg66xpj52JErHUBU4pZ1yageL4TVDDpTTSsv8mK6YaH", // empty memo
}

// ---------------------------------------------------------------------------
// Test vectors: field element signing
//
// Each entry contains the fullCommitment of the empty zkApp command above
// (computed via transactionCommitments() from o1js mina-signer), together
// with the expected signature produced by signFieldElement(fullCommitment, key, network).
//
// The commitment is 0n because there are no account updates (empty call forest).
// The fullCommitment = Poseidon.hashWithPrefix(accountUpdateCons, [memoHash, feePayerDigest, 0]).
// ---------------------------------------------------------------------------

export const ZKAPP_FIELD_ELEMENT_DATA = [
  {
    name: "empty_zkapp_devnet",
    // fullCommitment of EMPTY_ZKAPP_COMMAND on devnet
    fullCommitment: 15125478341151450434551337097321105823980530753786707595743937773095033818642n,
    account: 0,
    networkId: 0, // devnet
    expectedSignature: {
      field: 11619783670674005040286766680043318342744628142296660823840441823735301563062n,
      scalar: 5256877650906059721964298241491347735487277814428991042620254968055263398580n,
      base58: "7mXNThDyNizRWiWq2kbXMZ1SWm6hS4LPY9XFdMjkTUY9Q3SM6VpZUWHqx8oNVb4ypjU3g5asW3hjecFtHvm9LfrP4iGQfGKu",
    },
  },
  {
    name: "empty_zkapp_mainnet",
    // fullCommitment of EMPTY_ZKAPP_COMMAND on mainnet
    fullCommitment: 5490931312214959595156407183296387647560081342128903631300221129583487063453n,
    account: 0,
    networkId: 1, // mainnet
    expectedSignature: {
      field: 2851174318468409351646479056778061885738826089603624081964891973494880124377n,
      scalar: 13778505841453590681917294611129260196551995351800417708011118827598052499276n,
      base58: "7mXT5yaQuWh8ARufjCEakXRTcn7GXay9P6ju1Mf9MveQnKMsFAh6vcAnhraomMe3V1FMCApUoYscFodv6WScnAZXgD2Jkrcw",
    },
  },
]

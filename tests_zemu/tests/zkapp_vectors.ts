// Test vectors for zkApp field element signing
// Commitments from Mina PR #18203 (full_txn_commitment values)

// Convert a decimal string to 32-byte little-endian Buffer
export function commitmentToBytes(commitmentDecimal: string): Buffer {
  const bigint = BigInt(commitmentDecimal);
  const bytes = Buffer.alloc(32);
  // Little-endian encoding
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number((bigint >> BigInt(i * 8)) & 0xFFn);
  }
  return bytes;
}

export const ZKAPP_FIELD_ELEMENT_DATA = [
  {
    name: "zkapp_field_testnet_simple",
    // full_txn_commitment from testnet empty zkApp command
    commitmentDecimal: "3041571627639553107763978219346471367756783628926005589985808519032108787934",
    account: 0,
    networkId: 0, // testnet
  },
  {
    name: "zkapp_field_mainnet_simple",
    // full_txn_commitment from mainnet empty zkApp command
    commitmentDecimal: "422045518501495772048071382727552080008668713741305956694382931481646868481",
    account: 0,
    networkId: 1, // mainnet
  },
]

// Private key for account 0 derived from Zemu test seed
// Matches public key: B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV
export const ZKAPP_PRIVATE_KEY = 'EKDt66ubGg5SDiwcQABWfFZaruq6idcyrLLfyZQjoH4CN3PHEiNj'

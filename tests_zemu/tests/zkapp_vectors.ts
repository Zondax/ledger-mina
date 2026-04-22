// Test vectors for zkApp field element signing

export function commitmentToBytes(commitment: bigint): Buffer {
  const bytes = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number((commitment >> BigInt(i * 8)) & 0xFFn);
  }
  return bytes;
}

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

export const ZKAPP_PRIVATE_KEY = 'EKDt66ubGg5SDiwcQABWfFZaruq6idcyrLLfyZQjoH4CN3PHEiNj'
export const ZKAPP_PUBLIC_KEY = 'B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV'

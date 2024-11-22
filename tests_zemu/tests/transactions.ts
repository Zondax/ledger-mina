import { TxType } from "@mina-wallet-adapter/mina-ledger-js";

export const TX_DATA = [
  {
    name: "test_sign_tx_0",
    txParams : {
      txType: TxType.PAYMENT,
      senderAccount: 0,
      senderAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
      amount: 1729000000000,
      fee: 2000000000,
      nonce: 16,
      validUntil: 271828,
      memo: 'Hello Mina!',
      networkId: 0
    },
    signature: "11a36a8dfe5b857b95a2a7b7b17c62c3ea33411ae6f4eb3a907064aecae353c60794f1d0288322fe3f8bb69d6fabd4fd7c15f8d09f8783b2f087a80407e299af"
  },
  {
    name: "test_sign_tx_12586",
    txParams: {
      txType: TxType.PAYMENT,
      senderAccount: 12586,
      senderAddress: "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
      receiverAddress: "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
      amount: 314159265359,
      fee: 1618033988,
      nonce: 0,
      validUntil: 4294967295,
      memo: "",
      networkId: 0
    },
    signature: "23a9e2375dd3d0cd061e05c33361e0ba270bf689c4945262abdcc81d7083d8c311ae46b8bebfc98c584e2fb54566851919b58cf0917a256d2c1113daa1ccb27f"
  },
  /* Mina JS Package does not allow fees smaller than 1e6
  {
    name: "test_sign_tx_12586_1",
    txParams: {
      txType: TxType.PAYMENT,
      senderAccount: 12586,
      senderAddress: "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
      receiverAddress: "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
      amount: 271828182845904,
      fee: 100000,
      nonce: 5687,
      validUntil: 4294967295,
      memo: "01234567890123456789012345678901",
      networkId: 0
    },
    signature: "2b4d0bffcb57981d11a93c05b17672b7be700d42af8496e1ba344394da5d0b0b0432c1e8a77ee1bd4b8ef6449297f7ed4956b81df95bdc6ac95d128984f77205"
  },
  */
  /* Mina JS Package does not allow Payments with amount 0
  {
    name: "test_sign_tx_3",
    txParams: {
      txType: TxType.PAYMENT,
      senderAccount: 3,
      senderAddress: "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
      receiverAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      amount: 0,
      fee: 2000000000,
      nonce: 0,
      validUntil: 1982,
      memo: "",
      networkId: 0
    },
    signature: "25bb730a25ce7180b1e5766ff8cc67452631ee46e2d255bccab8662e5f1f0c850a4bb90b3e7399e935fff7f1a06195c6ef89891c0260331b9f381a13e5507a4c"
  },
  */
  {
    name: "test_sign_tx_0_1",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 0,
      senderAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
      amount: 0,
      fee: 2000000000,
      nonce: 16,
      validUntil: 1337,
      memo: "Delewho?",
      networkId: 0
    },
    signature: "30797d7d0426e54ff195d1f94dc412300f900cc9e84990603939a77b3a4d2fc11ebab12857b47c481c182abe147279732549f0fd49e68d5541f825e9d1e6fa04"
  },
  {
    name: "test_sign_tx_49370",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 49370,
      senderAddress: "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
      receiverAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      amount: 0,
      fee: 2000000000,
      nonce: 0,
      validUntil: 4294967295,
      memo: "",
      networkId: 0
    },
    signature: "07e9f88fc671ed06781f9edb233fdbdee20fa32303015e795747ad9e43fcb47b3ce34e27e31f7c667756403df3eb4ce670d9175dd0ae8490b273485b71c56066"
  },
  {
    name: "test_sign_tx_12586_2",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 12586,
      senderAddress: "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
      receiverAddress: "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
      amount: 0,
      fee: 42000000000,
      nonce: 1,
      validUntil: 4294967295,
      memo: "more delegates, more fun........",
      networkId: 0
    },
    signature: "1ff9f77fed4711e0ebe2a7a46a7b1988d1b62a850774bf299ec71a24d5ebfdd81d04a570e4811efe867adefe3491ba8b210f24bd0ec8577df72212d61b569b15"
  },
  {
    name: "test_sign_tx_2",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 2,
      senderAddress: "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
      receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
      amount: 0,
      fee: 1202056900,
      nonce: 0,
      validUntil: 577216,
      memo: "",
      networkId: 0
    },
    signature: "26ca6b95dee29d956b813afa642a6a62cd89b1929320ed6b099fd191a217b08d2c9a54ba1c95e5000b44b93cfbd3b625e20e95636f1929311473c10858a27f09"
  },
  {
    name: "test_sign_tx_0_2",
    txParams: {
      txType: TxType.PAYMENT,
      senderAccount: 0,
      senderAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
      amount: 1729000000000,
      fee: 2000000000,
      nonce: 16,
      validUntil: 271828,
      memo: "Hello Mina!",
      networkId: 1
    },
    signature: "124c592178ed380cdffb11a9f8e1521bf940e39c13f37ba4c55bb4454ea69fba3c3595a55b06dac86261bb8ab97126bf3f7fff70270300cb97ff41401a5ef789"
  },
  {
    name: "test_sign_tx_12586_3",
    txParams: {
      txType: TxType.PAYMENT,
      senderAccount: 12586,
      senderAddress: "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
      receiverAddress: "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
      amount: 314159265359,
      fee: 1618033988,
      nonce: 0,
      validUntil: 4294967295,
      memo: "",
      networkId: 1
    },
    signature: "204eb1a37e56d0255921edd5a7903c210730b289a622d45ed63a52d9e3e461d13dfcf301da98e218563893e6b30fa327600c5ff0788108652a06b970823a4124"
  },
  /* Mina JS Package does not allow fees smaller than 1e6
  {
    name: "test_sign_tx_12586_4",
    txParams: {
      txType: TxType.PAYMENT,
      senderAccount: 12586,
      senderAddress: "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
      receiverAddress: "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
      amount: 271828182845904,
      fee: 100000,
      nonce: 5687,
      validUntil: 4294967295,
      memo: "01234567890123456789012345678901",
      networkId: 1
    },
    signature: "076d8ebca8ccbfd9c8297a768f756ff9d08c049e585c12c636d57ffcee7f6b3b1bd4b9bd42cc2cbee34b329adbfc5127fe5a2ceea45b7f55a1048b7f1a9f7559"
  },
  */
  /* Mina JS Package does not allow Payments with amount 0
  {
    name: "test_sign_tx_3_1",
    txParams: {
      txType: TxType.PAYMENT,
      senderAccount: 3,
      senderAddress: "B62qoqiAgERjCjXhofXiD7cMLJSKD8hE8ZtMh4jX5MPNgKB4CFxxm1N",
      receiverAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      amount: 0,
      fee: 2000000000,
      nonce: 0,
      validUntil: 1982,
      memo: "",
      networkId: 1
    },
    signature: "058ed7fb4e17d9d400acca06fe20ca8efca2af4ac9a3ed279911b0bf93c45eea0e8961519b703c2fd0e431061d8997cac4a7574e622c0675227d27ce2ff357d9"
  },
  */
  {
    name: "test_sign_tx_0_3",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 0,
      senderAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
      amount: 0,
      fee: 2000000000,
      nonce: 16,
      validUntil: 1337,
      memo: "Delewho?",
      networkId: 1
    },
    signature: "0904e9521a95334e3f6757cb0007ec8af3322421954255e8d263d0616910b04d213344f8ec020a4b873747d1cbb07296510315a2ec76e52150a4c765520d387f"
  },
  {
    name: "test_sign_tx_49370_1",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 49370,
      senderAddress: "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
      receiverAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
      amount: 0,
      fee: 2000000000,
      nonce: 0,
      validUntil: 4294967295,
      memo: "",
      networkId: 1
    },
    signature: "2406ab43f8201bd32bdd81b361fdb7871979c0eec4e3b7a91edf87473963c8a4069f4811ebc5a0e85cbb4951bffe93b638e230ce5a250cb08d2c250113a1967c"
  },
  {
    name: "test_sign_tx_12586_5",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 12586,
      senderAddress: "B62qoG5Yk4iVxpyczUrBNpwtx2xunhL48dydN53A2VjoRwF8NUTbVr4",
      receiverAddress: "B62qkiT4kgCawkSEF84ga5kP9QnhmTJEYzcfgGuk6okAJtSBfVcjm1M",
      amount: 0,
      fee: 42000000000,
      nonce: 1,
      validUntil: 4294967295,
      memo: "more delegates, more fun........",
      networkId: 1
    },
    signature: "36a80d0421b9c0cbfa08ea95b27f401df108b30213ae138f1f5978ffc59606cf2b64758db9d26bd9c5b908423338f7445c8f0a07520f2154bbb62926aa0cb8fa"
  },
  {
    name: "test_sign_tx_2_1",
    txParams: {
      txType: TxType.DELEGATION,
      senderAccount: 2,
      senderAddress: "B62qrKG4Z8hnzZqp1AL8WsQhQYah3quN1qUj3SyfJA8Lw135qWWg1mi",
      receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
      amount: 0,
      fee: 1202056900,
      nonce: 0,
      validUntil: 577216,
      memo: "",
      networkId: 1
    },
    signature: "093f9ef0e4e051279da0a3ded85553847590ab739ee1bfd59e5bb30f98ed8a001a7a60d8506e2572164b7a525617a09f17e1756ac37555b72e01b90f37271595"
  }
]

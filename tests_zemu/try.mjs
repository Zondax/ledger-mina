import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { MinaLedgerJS } from "@mina-wallet-adapter/mina-ledger-js"


async function main() {
  const transport = await TransportNodeHid.default.open()

  const app = new MinaLedgerJS(transport)

  const txParams = {
    txType: 0,
    senderAccount: 0,
    senderAddress: "B62qrz4ep5v5n7kZhQZw7jGawqJnzNDF2ZbrNoMUDPAMRMeJfe8kEB2",
    receiverAddress: "B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt",
    amount: 1729000000000,
    fee: 2000000000,
    nonce: 16,
    validUntil: 271828,
    memo: 'Hello Mina!',
    networkId: 0

    //   txType: 4,
    //   senderAccount: 0,
    //   senderAddress: "B62qrz4ep5v5n7kZhQZw7jGawqJnzNDF2ZbrNoMUDPAMRMeJfe8kEB2",
    //   receiverAddress: "B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV",
    //   amount: 0,
    //   fee: 2000000000,
    //   nonce: 0,
    //   validUntil: 4294967295,
    //   memo: "",
    //   networkId: 0

  }

  const ACCOUNT_ID = 0

  const resp = await app.getAppVersion()
  console.log(resp)
  
//   const reqGetAddress = await app.getAddress(ACCOUNT_ID)
//   console.log(reqGetAddress)

  const signatureRequest = app.signTransaction(txParams)
  const signatureResponse = await signatureRequest
  console.log(signatureResponse)



}

;(async () => {
  await main()
})()

import Zemu, { DEFAULT_START_OPTIONS, IDeviceModel, isTouchDevice } from "@zondax/zemu"
import { defaultOptions, models } from "./common"
import { MinaApp } from "@zondax/ledger-mina-js"
import { FIELD_DATA } from "./transactions"
import { Client } from 'mina-signer'

jest.setTimeout(60000)

describe.each(FIELD_DATA)('Field Signing', function (data) {
  test.concurrent.each(models)(`${data.name}`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

       // do not wait here.. we need to navigate
       const signatureRequest = app.signFieldElement(data.account, data.networkId, data.commitment)

       // Wait until we are not in the main menu
       await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
       await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-${data.name}`, true)

       // Signature from device
       const signatureResponse = await signatureRequest
       console.log(signatureResponse)

      //const signer = new Client({ network: data.networkId === 0 ? 'testnet' : 'mainnet' });

      //let signed = await signer.signFields([BigInt(data.commitment)], data.privateKey)
      //console.log(signed.signature)


      // Signature from SDK
//      const sdkSignature = await signer.signFields([BigInt(data.commitment)], data.privateKey)

    //   let field_hex = BigInt(sdkSignature.signature.field).toString(16);
    //   let scalar_hex = BigInt(sdkSignature.signature.scalar).toString(16);
      
    //   // Zero padding at the start in case of odd length
    //   field_hex = field_hex.padStart(field_hex.length + (field_hex.length % 2), '0');
    //   scalar_hex = scalar_hex.padStart(scalar_hex.length + (scalar_hex.length % 2), '0');
    //   const signatureSdkHex = field_hex + scalar_hex;

    //   expect(signatureResponse.field).toBe(sdkSignature.signature.field)
    //   expect(signatureResponse.scalar).toBe(sdkSignature.signature.scalar)
    //   expect(signatureResponse.raw_signature).toBe(signatureSdkHex)
    } finally {
      await sim.close()
    }
  })
})

function setTextOptions(m: IDeviceModel) {
  if (isTouchDevice(m.name)) {
    defaultOptions.startText = 'This app enables'
  } else {
    defaultOptions.startText = DEFAULT_START_OPTIONS.startText
  }
}

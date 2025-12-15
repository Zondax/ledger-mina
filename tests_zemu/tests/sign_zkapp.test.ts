import Zemu, { DEFAULT_START_OPTIONS, IDeviceModel, isTouchDevice } from "@zondax/zemu"
import { defaultOptions, models } from "./common"
import { MinaApp } from "@zondax/ledger-mina-js"
import { ZKAPP_FIELD_ELEMENT_DATA, ZKAPP_PRIVATE_KEY, commitmentToBytes } from "./zkapp_vectors"
import { Client } from 'mina-signer'

jest.setTimeout(60000)

describe.each(ZKAPP_FIELD_ELEMENT_DATA)('zkApp field element signing', function (data) {
  test.concurrent.each(models)(`${data.name}`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      // Convert commitment decimal string to 32-byte field element
      const fieldBytes = commitmentToBytes(data.commitmentDecimal)

      // Sign with Ledger using field element signing
      const signatureRequest = app.signFieldElement(
        data.account,
        data.networkId,
        fieldBytes
      )

      // Wait for and approve the signing prompt
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-${data.name}`, true)

      const signatureResponse = await signatureRequest

      // Verify we got a valid response
      expect(signatureResponse.returnCode).toBe("9000")
      expect(signatureResponse.field).not.toBeNull()
      expect(signatureResponse.scalar).not.toBeNull()

      // Generate expected signature using mina-signer SDK
      const signer = new Client({ network: data.networkId === 0 ? 'testnet' : 'mainnet' })

      // signFields signs field elements in SNARK-compatible (Kimchi) way
      const commitmentBigint = BigInt(data.commitmentDecimal)
      const sdkSignature = signer.signFields([commitmentBigint], ZKAPP_PRIVATE_KEY)

      // Compare signatures
      expect(signatureResponse.field).toBe(sdkSignature.signature.field)
      expect(signatureResponse.scalar).toBe(sdkSignature.signature.scalar)
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

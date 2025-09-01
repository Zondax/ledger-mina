import Zemu, { DEFAULT_START_OPTIONS, IDeviceModel, isTouchDevice } from "@zondax/zemu"
import { defaultOptions, models } from "./common"
import { MinaApp } from "@zondax/ledger-mina-js"
import { ZKAPP_FIELD_ELEMENT_DATA, ZKAPP_PUBLIC_KEY, commitmentToBytes } from "./zkapp_vectors"
import { Signature } from 'o1js'

jest.setTimeout(60000)

describe.each(ZKAPP_FIELD_ELEMENT_DATA)('zkApp field element signing', function (data) {
  test.concurrent.each(models)(`${data.name}`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const fieldBytes = commitmentToBytes(data.fullCommitment)

      const signatureRequest = app.signFieldElement(
        data.account,
        data.networkId,
        fieldBytes
      )

      // Wait for and approve the signing prompt
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-${data.name}`, true)

      const signatureResponse = await signatureRequest

      expect(signatureResponse.returnCode).toBe("9000")
      expect(signatureResponse.field).not.toBeNull()
      expect(signatureResponse.scalar).not.toBeNull()

      const ledgerSignatureForVerify = {
        signature: Signature.fromJSON({
          r: signatureResponse.field!,
          s: signatureResponse.scalar!
        }).toBase58(),
        publicKey: ZKAPP_PUBLIC_KEY,
        data: [data.fullCommitment]
      }

      expect(signatureResponse.field).toBe(data.expectedSignature.field.toString())
      expect(signatureResponse.scalar).toBe(data.expectedSignature.scalar.toString())
      expect(ledgerSignatureForVerify.signature).toBe(data.expectedSignature.base58)
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

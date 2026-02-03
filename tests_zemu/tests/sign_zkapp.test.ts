import Zemu, { ButtonKind, DEFAULT_START_OPTIONS, IDeviceModel, isTouchDevice, TouchNavigation } from "@zondax/zemu"
import { defaultOptions, models } from "./common"
import { MinaApp } from "@zondax/ledger-mina-js"
import { ZKAPP_FIELD_ELEMENT_DATA, ZKAPP_PUBLIC_KEY, commitmentToBytes } from "./zkapp_vectors"
import { Signature } from 'o1js'

jest.setTimeout(90000)

// Helper to toggle blind signing in our app's menu structure
async function toggleBlindSigningMina(sim: Zemu, m: IDeviceModel) {
  if (isTouchDevice(m.name)) {
    // For touch devices: navigate to settings and toggle the switch
    const nav = new TouchNavigation(m.name, [
      ButtonKind.InfoButton,       // Open info/settings
      ButtonKind.ToggleSettingButton1,  // Toggle first setting (blind signing)
      ButtonKind.SettingsQuitButton,    // Exit settings
    ])
    await sim.navigate('.', `${m.prefix.toLowerCase()}-toggle_blindsign`, nav.schedule, true, false)
  } else {
    // For BAGL devices: navigate to blind signing step (position 4) and click both
    // Menu: Mina(0) -> Version(1) -> Developer(2) -> Copyright(3) -> Blind signing(4) -> Quit(5)
    for (let i = 0; i < 4; i++) {
      await sim.clickRight()
    }
    await sim.clickBoth()  // Toggle blind signing
  }
}

// Helper to approve blind signing review for touch devices
async function approveBlindSigningReview(sim: Zemu, m: IDeviceModel, snapPath: string) {
  if (isTouchDevice(m.name)) {
    // NBGL blind signing review flow - use isBlindSigning=true parameter
    await sim.compareSnapshotsAndApprove('.', snapPath, true, 0, 45000, true)
  } else {
    await sim.compareSnapshotsAndApprove('.', snapPath, true)
  }
}

// Test that field element signing is rejected when blind signing is disabled
describe('zkApp field element signing - blind signing disabled', function () {
  test.concurrent.each(models)('rejected when blind signing disabled', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const data = ZKAPP_FIELD_ELEMENT_DATA[0]
      const fieldBytes = commitmentToBytes(data.fullCommitment)

      const signatureRequest = app.signFieldElement(
        data.account,
        data.networkId,
        fieldBytes
      )

      // Wait for the blind signing disabled screen
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())

      if (isTouchDevice(m.name)) {
        // For touch devices: NBGL shows status screen that auto-dismisses or can be tapped
        // Use navigation to tap and dismiss the status
        const snapPath = `${m.prefix.toLowerCase()}-blind_disabled`
        const nav = new TouchNavigation(m.name, [
          ButtonKind.DynamicTapButton,  // Tap to dismiss status
        ])
        await sim.navigate('.', snapPath, nav.schedule, true, false)
      } else {
        // For BAGL: navigate through rejection screens to Reject
        await sim.navigateAndCompareUntilText('.', `${m.prefix.toLowerCase()}-blind_disabled`, 'Reject', true, 0)
        // Click Reject - ignore timeout since response may arrive before screen updates
        try {
          await sim.clickBoth()
        } catch (e) {
          // Expected - screen may not change if response arrives quickly
        }
      }

      const signatureResponse = await signatureRequest

      // Expect rejection (conditions denied) - 0x6985 = 27013 decimal
      expect(signatureResponse.returnCode).toBe("27013")
    } finally {
      await sim.close()
    }
  })
})

// Test field element signing with blind signing enabled
describe.each(ZKAPP_FIELD_ELEMENT_DATA)('zkApp field element signing', function (data) {
  test.concurrent.each(models)(`${data.name}`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      // Enable blind signing before attempting to sign field elements
      await toggleBlindSigningMina(sim, m)

      const fieldBytes = commitmentToBytes(data.fullCommitment)

      const signatureRequest = app.signFieldElement(
        data.account,
        data.networkId,
        fieldBytes
      )

      // Wait for and approve the signing prompt (includes blind signing warning)
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await approveBlindSigningReview(sim, m, `${m.prefix.toLowerCase()}-${data.name}`)

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

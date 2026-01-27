import Zemu, { DEFAULT_START_OPTIONS, IDeviceModel, isTouchDevice } from "@zondax/zemu"
import { defaultOptions, models } from "./common"
import { MinaApp } from "@zondax/ledger-mina-js"
import { ZKAPP_FIELD_ELEMENT_DATA, ZKAPP_PRIVATE_KEY, commitmentToBytes } from "./zkapp_vectors"
import { Client } from 'mina-signer'

jest.setTimeout(120000)

// ---------------------------------------------------------------------------
// Verify test vectors against mina-signer (no Ledger needed)
// ---------------------------------------------------------------------------

// Decode a Mina base58check signature to { field, scalar } bigints.
// Format: base58(version(2) || r(32 LE) || s(32 LE) || checksum(4))
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function decodeMinaSignature(sig: string): { field: bigint; scalar: bigint } {
  let result = 0n
  for (const c of sig) {
    result = result * 58n + BigInt(BASE58_ALPHABET.indexOf(c))
  }
  const bytes: number[] = []
  while (result > 0n) {
    bytes.unshift(Number(result & 0xFFn))
    result >>= 8n
  }
  for (const c of sig) {
    if (c === '1') bytes.unshift(0)
    else break
  }

  const payload = bytes.slice(2, bytes.length - 4)
  if (payload.length !== 64) {
    throw new Error(`Unexpected signature payload length: ${payload.length}`)
  }

  const rLE = payload.slice(0, 32)
  const sLE = payload.slice(32, 64)
  const r = BigInt('0x' + Buffer.from(rLE).reverse().toString('hex'))
  const s = BigInt('0x' + Buffer.from(sLE).reverse().toString('hex'))
  return { field: r, scalar: s }
}

describe('mina-signer cross-check', () => {
  // Only devnet — mina-signer uses 'testnet' for networkId 0
  const devnetVectors = ZKAPP_FIELD_ELEMENT_DATA.filter(d => d.networkId === 0)

  test.each(devnetVectors)('$name: signFields matches expected signature', (data) => {
    const signer = new Client({ network: 'testnet' })
    const sdkResult = signer.signFields([data.fullCommitment], ZKAPP_PRIVATE_KEY)
    const sdkSig = decodeMinaSignature(sdkResult.signature)

    expect(sdkSig.field).toBe(data.expectedSignature.field)
    expect(sdkSig.scalar).toBe(data.expectedSignature.scalar)
  })
})

// ---------------------------------------------------------------------------
// Ledger signing tests
// ---------------------------------------------------------------------------

describe.each(ZKAPP_FIELD_ELEMENT_DATA)('Ledger zkApp field element signing', (data) => {
  test.each(models)(`${data.name} - $name`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport() as any)

      const fieldBytes = commitmentToBytes(data.fullCommitment)

      // Fire off the signing request (async — waits for user approval)
      const signatureRequest = app.signFieldElement(
        data.account,
        data.networkId,
        fieldBytes
      )

      // Give the app time to process the APDU and show the UI
      await Zemu.sleep(3000)

      // Navigate through the approval flow without waiting for screen updates.
      // Testnet flow: Topic → Network → Message → Approve → Reject (3 right-clicks to Approve)
      // Mainnet flow: Topic → Message → Approve → Reject (2 right-clicks to Approve)
      if (isTouchDevice(m.name)) {
        await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-${data.name}`, true)
      } else {
        const clicksToApprove = data.networkId === 0 ? 3 : 2
        for (let i = 0; i < clicksToApprove; i++) {
          await sim.clickRight('', false)
          await Zemu.sleep(500)
        }
        await sim.clickBoth('', false)
        await Zemu.sleep(5000)
      }

      const signatureResponse = await signatureRequest

      // Verify we got a valid response (not rejected by firmware)
      expect(signatureResponse.returnCode).toBe("9000")
      expect(signatureResponse.field).not.toBeNull()
      expect(signatureResponse.scalar).not.toBeNull()

      // Compare Ledger signature against expected test vector.
      // NOTE: This is expected to FAIL until the Ledger firmware correctly
      // implements Kimchi-mode deriveNonce() and hashMessage().
      // See the full issue list for details on what needs to change in
      // message_derive() and message_hash() in crypto.c.
      expect(BigInt(signatureResponse.field!)).toBe(data.expectedSignature.field)
      expect(BigInt(signatureResponse.scalar!)).toBe(data.expectedSignature.scalar)
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

import Zemu, { DEFAULT_START_OPTIONS, IDeviceModel, isTouchDevice } from '@zondax/zemu'
import { MinaApp } from '@zondax/ledger-mina-js'
import bs58 from 'bs58'
import { createHash } from 'node:crypto'

import { defaultOptions, models } from './common'
import { TX_DATA } from './transactions'

jest.setTimeout(120000)

// The app throws INVALID_PARAMETER (0x2) when it refuses to parse a command,
// which main.c maps onto the 0x6802 status word and returns to the main menu.
const SW_INVALID_PARAMETER = '26626'

// A payment the suite already has a recorded signature for.
const PAYMENT = TX_DATA.find(tx => tx.name === 'test_sign_tx_0')!

// A delegation the suite already has a recorded signature for. Its amount is
// zero, and zero is what the device has to commit to whatever the host sends.
const DELEGATION = TX_DATA.find(tx => tx.name === 'test_sign_tx_0_1')!

// Re-encode an address after mutating its decoded bytes so the checksum stays
// valid. This is what the device has to catch on its own: a correct base58check
// checksum says nothing about whether the version bytes are the ones Mina uses,
// and an address the device accepts but the network rejects is a disagreement
// about which key is being signed for.
function reencode(address: string, mutate: (raw: Buffer) => void): string {
  const raw = Buffer.from(bs58.decode(address))
  mutate(raw)
  const checksum = createHash('sha256')
    .update(createHash('sha256').update(raw.subarray(0, 36)).digest())
    .digest()
  checksum.copy(raw, 36, 0, 4)
  const encoded = bs58.encode(raw)
  // The app length-checks before decoding, so a forgery is only interesting
  // while it still looks like an address.
  expect(encoded).toHaveLength(55)
  return encoded
}

function setTextOptions(m: IDeviceModel) {
  if (isTouchDevice(m.name)) {
    defaultOptions.startText = 'This app enables'
  } else {
    defaultOptions.startText = DEFAULT_START_OPTIONS.startText
  }
}

// A command the device refuses must be refused before any review screen opens:
// nothing is shown to the user, and the device stays on the main menu.
async function expectRefusedWithoutReview(sim: Zemu, returnCode: string) {
  expect(returnCode).toEqual(SW_INVALID_PARAMETER)
  await sim.waitUntilScreenIs(sim.getMainMenuSnapshot())
}

describe('Address validation', function () {
  test.concurrent.each(models)('rejects a wrong base58check version ($name)', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const receiverAddress = reencode(PAYMENT.txParams.receiverAddress, raw => {
        raw[0] = 0xcc // Mina uses 0xcb
      })

      const { returnCode } = await app.signTransaction({ ...PAYMENT.txParams, receiverAddress })
      await expectRefusedWithoutReview(sim, returnCode)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('rejects a wrong curve point version ($name)', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const receiverAddress = reencode(PAYMENT.txParams.receiverAddress, raw => {
        raw[1] = 0x02 // non_zero_curve_point version is 0x01
      })

      const { returnCode } = await app.signTransaction({ ...PAYMENT.txParams, receiverAddress })
      await expectRefusedWithoutReview(sim, returnCode)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('rejects a non-boolean y parity ($name)', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const senderAddress = reencode(PAYMENT.txParams.senderAddress, raw => {
        raw[35] = 0x7f // the y-coordinate parity is a bool
      })

      const { returnCode } = await app.signTransaction({ ...PAYMENT.txParams, senderAddress })
      await expectRefusedWithoutReview(sim, returnCode)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('rejects an address that decodes short ($name)', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      // 55 valid base58 characters that decode to fewer than 40 bytes. The
      // checksum used to be read from whatever the stack held past the decode.
      const receiverAddress = '1'.repeat(55)

      const { returnCode } = await app.signTransaction({ ...PAYMENT.txParams, receiverAddress })
      await expectRefusedWithoutReview(sim, returnCode)
    } finally {
      await sim.close()
    }
  })
})

describe('Delegation amount', function () {
  test.concurrent.each(models)(
    'is not committed to when the host supplies one ($name)',
    async function (m) {
      const sim = new Zemu(m.path)
      try {
        setTextOptions(m)
        await sim.start({ ...defaultOptions, model: m.name })
        const app = new MinaApp(sim.getTransport())

        // Same delegation as test_sign_tx_0_1, except the host fills the amount
        // field with a value the BAGL review flow never puts on screen.
        const signatureRequest = app.signTransaction({
          ...DELEGATION.txParams,
          amount: 1234567890,
        })

        await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
        await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-sec_delegation_hidden_amount`, true)

        const signatureResponse = await signatureRequest

        // Identical to the signature recorded for the same delegation with a
        // zero amount: the hidden bytes never reached the signed hash.
        expect(signatureResponse.returnCode).toEqual('9000')
        expect(signatureResponse.signature).toEqual(DELEGATION.signature)
      } finally {
        await sim.close()
      }
    },
  )
})

describe('Message signing', function () {
  test.concurrent.each(models)('rejects an embedded NUL before the review ($name)', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      // The review screen renders the message as a C string, so the user would
      // approve what is visible while the signature covered the hidden tail.
      const message = 'visible' + String.fromCharCode(0) + 'hidden'

      const { returnCode } = await app.signMessage(0, 0, message)
      await expectRefusedWithoutReview(sim, returnCode)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('rejects a control character before the review ($name)', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptions(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const message = 'bell' + String.fromCharCode(7) + 'here'

      const { returnCode } = await app.signMessage(0, 0, message)
      await expectRefusedWithoutReview(sim, returnCode)
    } finally {
      await sim.close()
    }
  })
})

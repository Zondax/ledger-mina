/** ******************************************************************************
 *  (c) 2018 - 2023 Zondax AG
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */

import Zemu, { zondaxMainmenuNavigation } from '@zondax/zemu'
import { MinaLedgerJS, TxType } from '@mina-wallet-adapter/mina-ledger-js'
import { PATH, defaultOptions, models, txBlobExample } from './common'

// @ts-expect-error
import ed25519 from 'ed25519-supercop'

jest.setTimeout(60000)

const expected_pk = 'B62qm8nLYdyErJeR3yQQJs1PX56zdoYHo5dKqvYbYoFU4zEok3wWT74'

describe('Standard', function () {
  test.concurrent.each(models)('can start and stop container', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('main menu', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const nav = zondaxMainmenuNavigation(m.name, [1, 1, -2])
      await sim.navigateAndCompareSnapshots('.', `${m.prefix.toLowerCase()}-mainmenu`, nav.schedule)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get app version', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaLedgerJS(sim.getTransport())

      const resp = await app.getAppVersion()
      console.log(resp)

      expect(resp.version).toEqual('1.0.2')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get address', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaLedgerJS(sim.getTransport())

      const resp = await app.getAddress()

      if (resp.publicKey) {
         console.log("Public key:", Buffer.from(resp.publicKey).toString('hex'))
      }

      expect(resp.publicKey).toEqual(expected_pk)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('sign tx0 normal', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaLedgerJS(sim.getTransport())

      const txBlob = Buffer.from(txBlobExample)
      const responseAddr = await app.getAddress()
      if (!responseAddr.publicKey) {
        throw new Error("Failed to get public key from device")
      }
      const pubKey = responseAddr.publicKey

      const txParams = {
          txType: TxType.PAYMENT,
          senderAccount: 0,
          senderAddress: responseAddr.publicKey,
          receiverAddress: 'B62qicipYxyEHu7QjUqS7QvBipTs5CzgkYZZZkPoKVYBu6tnDUcE9Zt',
          amount: 1729000000000,
          fee: 2000000000,
          nonce: 16,
          validUntil: 271828,
          memo: 'Hello Mina!',
          networkId: 0 //Testnet
      }

      // do not wait here.. we need to navigate
      const signatureRequest = app.signTransaction(txParams)

      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-sign_tx0`, true)

      const signatureResponse = await signatureRequest
      console.log(signatureResponse)

      // Now verify the signature
      const prehash = Buffer.concat([Buffer.from('TX'), txBlob]);
      const valid = ed25519.verify(signatureResponse.signature, prehash, pubKey)
      expect(valid).toEqual(true)
    } finally {
      await sim.close()
    }
  })
})

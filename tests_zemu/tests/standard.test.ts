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

import Zemu, { ButtonKind, IDeviceModel, isTouchDevice, TouchNavigation, zondaxMainmenuNavigation } from '@zondax/zemu'
import { MinaLedgerJS } from '@mina-wallet-adapter/mina-ledger-js'
import { PATH, defaultOptions, models, setStartText } from './common'

jest.setTimeout(60000)

const expected_pk = 'B62qm8nLYdyErJeR3yQQJs1PX56zdoYHo5dKqvYbYoFU4zEok3wWT74'

describe('Standard', function () {
  test.concurrent.each(models)('can start and stop container', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setStartText(m)
      await sim.start({ ...defaultOptions, model: m.name })
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('main menu', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setStartText(m)
      await sim.start({ ...defaultOptions, model: m.name })
      let nav
      if (isTouchDevice(m.name)) {
        nav = new TouchNavigation(m.name, [
          ButtonKind.InfoButton,
          ButtonKind.SettingsQuitButton,
        ]);
      } else {
        nav = zondaxMainmenuNavigation(m.name, [1, 1, -2])
      }
      await sim.navigateAndCompareSnapshots('.', `${m.prefix.toLowerCase()}-mainmenu`, nav.schedule)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get app version', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setStartText(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaLedgerJS(sim.getTransport())

      const resp = await app.getAppVersion()
      console.log(resp)

      expect(resp.version).toEqual('1.0.2')
    } finally {
      await sim.close()
    }
  })

  // TODO: Test multiple accounts
  /*
  test.concurrent.each(models)('get address', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setStartText(m)
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
    */
})

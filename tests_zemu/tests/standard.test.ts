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

import Zemu, { ButtonKind, DEFAULT_START_OPTIONS, IDeviceModel, isTouchDevice, TouchNavigation, zondaxMainmenuNavigation } from '@zondax/zemu'
import { MinaLedgerJS } from '@mina-wallet-adapter/mina-ledger-js'
import { PATH, defaultOptions, models } from './common'

jest.setTimeout(60000)

const expected_pk = 'B62qnzbXmRNo9q32n4SNu2mpB8e7FYYLH8NmaX6oFCBYjjQ8SbD7uzV'

describe('Standard', function () {
  test.concurrent.each(models)('can start and stop container', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptionsStandardTests(m)
      await sim.start({ ...defaultOptions, model: m.name })
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('main menu', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptionsStandardTests(m)
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
      setTextOptionsStandardTests(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaLedgerJS(sim.getTransport())

      const resp = await app.getAppVersion()
      console.log(resp)

      expect(resp.version).toEqual('1.0.2')
    } finally {
      await sim.close()
    }
  })

  // TODO: Check different accounts
  test.concurrent.each(models)('get address', async function (m) {
    const sim = new Zemu(m.path)
    try {
      setTextOptionsStandardTests(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaLedgerJS(sim.getTransport())

      const reqGetAddress = app.getAddress()

      // Navigate and approve
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())

      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-get-address`, true)

      if (!isTouchDevice(m.name)) {
        await sim.navigateAndCompareUntilText('.', `${m.prefix.toLowerCase()}-get-address`, 'Approve', true, 3)
      }

      const resp = await reqGetAddress

      expect(resp.publicKey).toEqual(expected_pk)
    } finally {
      await sim.close()
    }
  })
})

// TODO: Don't overwrite defaults, create new object
function setTextOptionsStandardTests(m: IDeviceModel) {
  if (isTouchDevice(m.name)) {
    defaultOptions.approveAction = 15 /* ButtonKind.ConfirmYesButton */
    defaultOptions.approveKeyword = 'Confirm'
    defaultOptions.startText = 'This app enables'
  } else {
    defaultOptions.approveAction = DEFAULT_START_OPTIONS.approveAction
    defaultOptions.approveKeyword = 'Generate|Approve'
    defaultOptions.startText = DEFAULT_START_OPTIONS.startText
  }
}
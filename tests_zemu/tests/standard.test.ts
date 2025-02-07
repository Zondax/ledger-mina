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
import { MinaApp } from '@zondax/ledger-mina-js'
import { PATH, defaultOptions, models } from './common'
import { ADDRESS_DATA } from './addresses'

jest.setTimeout(60000)

describe('Standard', function () {
  test.concurrent.each(models)('can start and stop container', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('main menu', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      let nav
      if (m.name === 'stax' || m.name === 'flex') {
        // main menu fits in a single screen
        nav = new TouchNavigation(m.name, [
          ButtonKind.InfoButton,
          ButtonKind.SettingsQuitButton,
        ]);
      } else {
        nav = zondaxMainmenuNavigation(m.name, [1, 1, 1, 1, 1, -5])
      }
      await sim.navigateAndCompareSnapshots('.', `${m.prefix.toLowerCase()}-mainmenu`, nav.schedule)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get app version', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const resp = await app.getAppVersion()
      console.log(resp)

      expect(resp.version).toEqual('1.4.2')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get app name', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const resp = await app.getAppName()
      console.log(resp)

      expect(resp.name).toEqual('Mina')
    } finally {
      await sim.close()
    }
  })

  describe.each(ADDRESS_DATA)('get address', function (data) {
    test.concurrent.each(models)(`${data.name}`, async function (m) {
      const sim = new Zemu(m.path)
      try {
        const options = setTextOptionsStandardTests(m)
        await sim.start({ ...options, model: m.name })
        const app = new MinaApp(sim.getTransport())
  
        const reqGetAddress = app.getAddress(data.account, false)

        const resp = await reqGetAddress
  
        expect(resp.publicKey).toEqual(data.expectedAddress)
      } finally {
          await sim.close()
        }
      })
    })

describe.each(ADDRESS_DATA)('show address', function (data) {
  test.concurrent.each(models)(`${data.name}`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const reqGetAddress = app.getAddress(data.account, true)

      // Navigate and approve
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())

      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-${data.name}`, true)

      if (!isTouchDevice(m.name)) {
        await sim.navigateAndCompareUntilText('.', `${m.prefix.toLowerCase()}-${data.name}`, 'Approve', true, 3)
      }

      const resp = await reqGetAddress

      expect(resp.publicKey).toEqual(data.expectedAddress)
    } finally {
        await sim.close()
      }
    })
  })
})

function setTextOptionsStandardTests(m: IDeviceModel) {
  const options = { ...defaultOptions }
  if (isTouchDevice(m.name)) {
    options.approveAction = 15 /* ButtonKind.ConfirmYesButton */
    options.approveKeyword = 'Confirm'
    options.startText = 'This app enables'
  } else {
    options.approveAction = DEFAULT_START_OPTIONS.approveAction
    options.approveKeyword = 'Generate|Approve'
    options.startText = DEFAULT_START_OPTIONS.startText
  }
  return options
}
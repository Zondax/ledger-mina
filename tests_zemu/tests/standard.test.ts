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
      if (isTouchDevice(m.name)) {
        // Navigate through settings: Info -> navigate to see blind signing -> quit
        nav = new TouchNavigation(m.name, [
          ButtonKind.InfoButton,           // Open info/settings
          ButtonKind.SettingsNavRightButton, // Navigate to see blind signing setting
          ButtonKind.SettingsQuitButton,   // Exit settings
        ]);
      } else {
        // Navigate through: Mina -> Version -> Developer -> Copyright -> Blind signing -> Quit
        nav = zondaxMainmenuNavigation(m.name, [1, 1, 1, 1, 1, 1, -6])
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

      expect(resp.version).toEqual('1.6.5')
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
    test.concurrent.each(models)(`get_${data.name}`, async function (m) {
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
  test.concurrent.each(models)(`show_${data.name}`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const reqGetAddress = app.getAddress(data.account, true)

      // Navigate and approve
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())

      if (isTouchDevice(m.name)) {
        // Wait for the processing spinner to finish as it's non-deterministic
        await sim.waitUntilTextDisappears('Processing', 60000)
      }

      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-${data.name}`, true)

      if (!isTouchDevice(m.name)) {
        // On nano, compareSnapshotsAndApprove navigates up to "Generate" which triggers
        // a "Processing..." screen. This picks up after processing finishes.
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

describe('Dispatcher lock', function () {
  test.concurrent.each(models)('two non-review APDUs on one session both succeed', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const first = await app.getAppVersion()
      expect(first.returnCode).toEqual('9000')
      expect(first.version).toEqual('1.6.5')

      const second = await app.getAppVersion()
      expect(second.returnCode).toEqual('9000')
      expect(second.version).toEqual('1.6.5')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('GET_CONF then non-confirm GET_ADDR both succeed', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const app = new MinaApp(sim.getTransport())

      const versionResp = await app.getAppVersion()
      expect(versionResp.returnCode).toEqual('9000')
      expect(versionResp.version).toEqual('1.6.5')

      const addrResp = await app.getAddress(ADDRESS_DATA[0].account, false)
      expect(addrResp.returnCode).toEqual('9000')
      expect(addrResp.publicKey).toEqual(ADDRESS_DATA[0].expectedAddress)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('unknown INS then GET_CONF — error path releases the lock', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const transport = sim.getTransport()
      const app = new MinaApp(transport)

      const firstSw = await captureSw(transport.send(0xe0, 0xff, 0, 0, Buffer.alloc(0)))
      expect(firstSw).toEqual(0x6d00)

      const versionResp = await app.getAppVersion()
      expect(versionResp.returnCode).toEqual('9000')
      expect(versionResp.version).toEqual('1.6.5')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('GET_CONF, unknown INS, GET_CONF — error in the middle of a chain', async function (m) {
    const sim = new Zemu(m.path)
    try {
      const options = setTextOptionsStandardTests(m)
      await sim.start({ ...options, model: m.name })
      const transport = sim.getTransport()
      const app = new MinaApp(transport)

      const first = await app.getAppVersion()
      expect(first.returnCode).toEqual('9000')
      expect(first.version).toEqual('1.6.5')

      const middleSw = await captureSw(transport.send(0xe0, 0xff, 0, 0, Buffer.alloc(0)))
      expect(middleSw).toEqual(0x6d00)

      const third = await app.getAppVersion()
      expect(third.returnCode).toEqual('9000')
      expect(third.version).toEqual('1.6.5')
    } finally {
      await sim.close()
    }
  })
})

async function captureSw(p: Promise<Buffer>): Promise<number> {
  try {
    const buf = await p
    return (buf[buf.length - 2] << 8) | buf[buf.length - 1]
  } catch (e: unknown) {
    const sw = (e as { statusCode?: number }).statusCode
    if (typeof sw !== 'number') throw e
    return sw
  }
}

function setTextOptionsStandardTests(m: IDeviceModel) {
  const options = { ...defaultOptions }
  if (isTouchDevice(m.name)) {
    options.approveAction = ButtonKind.ApproveTapButton
    options.approveKeyword = 'Confirm'
    options.startText = 'This app enables'
  } else {
    options.approveAction = DEFAULT_START_OPTIONS.approveAction
    options.approveKeyword = 'Generate|Approve'
    options.startText = DEFAULT_START_OPTIONS.startText
  }
  return options
}

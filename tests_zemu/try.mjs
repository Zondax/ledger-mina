import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { MinaApp } from '@zondax/ledger-mina-js'

const ACCOUNT = 0

async function showAddress(app) {
  try {
    const appName = await app.getAppName()
    console.log(appName)

    const resp = await app.getAppName()
    console.log(resp)

    let reqGetAddress = app.getAddress(ACCOUNT, false)
    let pubkey = await reqGetAddress
    console.log(pubkey)

    reqGetAddress = app.getAddress(ACCOUNT, true)
    pubkey = await reqGetAddress
    console.log(pubkey)
  } catch (e) {
    console.log(e)
  }
}


async function main() {
  const transport = await TransportNodeHid.default.open()

  const app = new MinaApp(transport)

  // Enable/disable(uncommenting) to try this features on a real device
  await showAddress(app)
}

;(async () => {
  await main()
})()

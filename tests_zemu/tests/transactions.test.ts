import Zemu from "@zondax/zemu"
import { defaultOptions, models, setStartText } from "./common"
import { MinaLedgerJS } from "@mina-wallet-adapter/mina-ledger-js"
import { TX_DATA } from "./transactions"

jest.setTimeout(60000)

describe.each(TX_DATA)('Tx transfer', function (data) {
  test.concurrent.each(models)(`${data.name}`, async function (m) {
    const sim = new Zemu(m.path)
    try {
      setStartText(m)
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new MinaLedgerJS(sim.getTransport())

      // do not wait here.. we need to navigate
      const signatureRequest = app.signTransaction(data.txParams)

      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-${data.name}`, true)

      const signatureResponse = await signatureRequest
      console.log(signatureResponse)

      expect(signatureResponse.signature).toEqual(data.signature)
    } finally {
      await sim.close()
    }
  })
})

import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { MinaApp } from '@zondax/ledger-mina-js'

const ACCOUNT = 0
const NETWORK_ID = 0 // devnet

function commitmentToBytes(commitment) {
  const bytes = Buffer.alloc(32)
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number((commitment >> BigInt(i * 8)) & 0xFFn)
  }
  return bytes
}

async function signZkField(app) {
  try {
    const fullCommitment = 15125478341151450434551337097321105823980530753786707595743937773095033818642n
    const fieldBytes = commitmentToBytes(fullCommitment)

    console.log('Signing field element...')
    const resp = await app.signFieldElement(ACCOUNT, NETWORK_ID, fieldBytes)
    console.log(resp)
  } catch (e) {
    console.log(e)
  }
}

async function main() {
  const transport = await TransportNodeHid.default.open()
  const app = new MinaApp(transport)

  await signZkField(app)
}

;(async () => {
  await main()
})()

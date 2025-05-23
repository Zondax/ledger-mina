import Zemu, {
  DEFAULT_START_OPTIONS,
  IDeviceModel,
  isTouchDevice,
} from "@zondax/zemu";
import { defaultOptions, models } from "./common";
import { MinaApp } from "@zondax/ledger-mina-js";
import { MSG_DATA } from "./transactions";
import { Client } from "mina-signer";

jest.setTimeout(60000);

describe.each(MSG_DATA)("Msg transfer", function (data) {
  test.concurrent.each(models)(`${data.name}`, async function (m) {
    const sim = new Zemu(m.path);
    try {
      setTextOptions(m);
      await sim.start({ ...defaultOptions, model: m.name });
      const app = new MinaApp(sim.getTransport());

      // do not wait here.. we need to navigate
      const signatureRequest = app.signMessage(
        data.msg.account,
        data.msg.networkId,
        data.msg.msg
      );

      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot());
      await sim.compareSnapshotsAndApprove(
        ".",
        `${m.prefix.toLowerCase()}-${data.name}`,
        true
      );

      // Signature from device
      const signatureResponse = await signatureRequest;

      const signer = new Client({
        network: data.msg.networkId === 0 ? "testnet" : "mainnet",
      });

      // Signature from SDK
      const sdkSignature = await signer.signMessage(
        "Message : " + data.msg.msg,
        data.privateKey
      );

      let field_hex = BigInt(sdkSignature.signature.field).toString(16);
      let scalar_hex = BigInt(sdkSignature.signature.scalar).toString(16);

      // Zero padding at the start in case of odd length
      field_hex = field_hex.padStart(
        field_hex.length + (field_hex.length % 2),
        "0"
      );
      scalar_hex = scalar_hex.padStart(
        scalar_hex.length + (scalar_hex.length % 2),
        "0"
      );
      const signatureSdkHex = field_hex + scalar_hex;

      expect(signatureResponse.field).toBe(sdkSignature.signature.field);
      expect(signatureResponse.scalar).toBe(sdkSignature.signature.scalar);
      expect(signatureResponse.raw_signature).toBe(signatureSdkHex);
      expect(signatureResponse.signed_message).toBe(
        "Message : " + data.msg.msg
      );
    } finally {
      await sim.close();
    }
  });
});

function setTextOptions(m: IDeviceModel) {
  if (isTouchDevice(m.name)) {
    defaultOptions.startText = "This app enables";
  } else {
    defaultOptions.startText = DEFAULT_START_OPTIONS.startText;
  }
}

import * as jose from "jose";

const privateKey = jose.importPKCS8(process.env.PRIVATE_KEY, "EdDSA");

export default class lib_token {
  private static privateKey: CryptoKey | null = null;

  private static async getPrivateKey() {
    if (!lib_token.privateKey) {
      lib_token.privateKey = await jose.importPKCS8(
        process.env.PRIVATE_KEY,
        "EdDSA",
      );
    }
  }

  public static async sign() {
    const privateKey = await lib_token.getPrivateKey();
  }
}

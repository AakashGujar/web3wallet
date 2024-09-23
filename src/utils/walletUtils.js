import { Buffer } from "buffer"; 
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import * as bip39 from "bip39";
import * as ed25519 from "ed25519-hd-key";

export function generateOrValidateSeedPhrase(inputSeed = '') {
  if (inputSeed) {
    if (!bip39.validateMnemonic(inputSeed)) {
      throw new Error("Invalid mnemonic");
    }
    return inputSeed;
  } else {
    return bip39.generateMnemonic();
  }
}

export async function createWallet(mnemonic, blockchain, index) {
  const seed = await bip39.mnemonicToSeed(mnemonic);

  if (blockchain === 'ethereum') {
    const hdNode = ethers.HDNodeWallet.fromSeed(seed);
    const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${index}`);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
  } else if (blockchain === 'solana') {
    const derivedSeed = ed25519.derivePath(`m/44'/501'/${index}'/0'`, seed).key;
    const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32));
    return {
      publicKey: keypair.publicKey.toBase58(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex')
    };
  } else {
    throw new Error("Unsupported blockchain");
  }
}
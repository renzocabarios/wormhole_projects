import { Wormhole, amount, signSendWait } from "@wormhole-foundation/sdk";
import solana from "@wormhole-foundation/sdk/platforms/solana";
import evm from "@wormhole-foundation/sdk/platforms/evm";

import "@wormhole-foundation/sdk-evm-ntt";
import "@wormhole-foundation/sdk-solana-ntt";

const SOLANA_KEY = "";
const SEPOLIA_KEY = ""; // EVM

(async () => {
  // Register chains

  const wh = new Wormhole("Testnet", [solana.Platform, evm.Platform]);

  const sourceChain = wh.getChain("Solana");
  const destinationChain = wh.getChain("Sepolia");

  // Get signers
  const sourceSigner = await solana.getSigner(sourceChain.chain, SOLANA_KEY);

  const destinationSigner = await evm.getSigner(
    destinationChain.chain,
    SEPOLIA_KEY
  );

  const sourceAddress = Wormhole.chainAddress(
    sourceChain.chain,
    sourceSigner.address()
  );

  const destinationAddress = Wormhole.chainAddress(
    destinationChain.chain,
    destinationSigner.address()
  );

  const sourceNTT = await sourceChain.getProtocol("Ntt", {
    ntt: "",
  });

  const destinationNTT = await destinationChain.getProtocol("Ntt", {
    ntt: "",
  });

  const amt = amount.units(
    amount.parse(0.001, await sourceNTT.getTokenDecimals())
  );

  const tx = sourceNTT.transfer(
    sourceAddress.address,
    amt,
    destinationAddress,
    {
      queue: false,
      automatic: false,
      gasDropoff: 0n,
    }
  );

  const txIds = await signSendWait(sourceChain, tx, sourceSigner);
  console.log("Source txs", txIds);

  const vaa = await wh.getVaa(
    txIds[txIds.length - 1].txid,
    "Ntt:WormholeTransfer",
    25 * 60 * 1000
  );

  console.log(vaa);

  const destinationTx = await signSendWait(
    destinationChain,
    destinationNTT.redeem([vaa!]),
    destinationSigner
  );

  console.log(destinationTx);
})();

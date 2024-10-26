import { Wormhole, wormhole } from "@wormhole-foundation/sdk"

import solana from "@wormhole-foundation/sdk/solana"
import evm from "@wormhole-foundation/sdk/evm"

const SOLANA_KEY = "";
const SEPOLIA_KEY = "";
(async () => {


	const wh = await wormhole("Testnet", [solana, evm])

	const sendChain = wh.getChain("Solana")
	const receiveChain = wh.getChain("Sepolia")

	const source = await (await solana()).getSigner(sendChain.getRpc(), SOLANA_KEY);
	const destination = await (await evm()).getSigner(receiveChain.getRpc(), SEPOLIA_KEY);

	const sourceAddress = Wormhole.chainAddress(sendChain.chain, source.address());
	const destinationAddress = Wormhole.chainAddress(receiveChain.chain, destination.address());

	const amount = 100_000n;
	const automatic = false;

	const transfer = await wh.circleTransfer(
		amount,
		sourceAddress,
		destinationAddress,
		automatic
	)


	const sourceTx = await transfer.initiateTransfer(source);
	console.log("Sending Started: ", sourceTx);

	const timeout = 60 * 1000;

	const attestId = await transfer.fetchAttestation(timeout);
	console.log("Fetch Attestation: ", attestId);

	const destinationTx = await transfer.completeTransfer(destination);
	console.log("Completed Transfer: ", destinationTx);

	console.log("Circle Trasnfer status: ", transfer);

})();

// ACTIVITY: Bridge -> Send USDC via wallet -> Repeat
// Repeat the cycle until it returns to the first guy
// List all the names of the participants

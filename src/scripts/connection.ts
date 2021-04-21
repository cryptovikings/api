const abi = require('./abi/nornir.json');
const ethers = require('ethers');
const dotenvsafe = require('dotenv-safe');

dotenvsafe.config({
	path: `${__dirname}/.env`,
	example: `${__dirname}/.env.example`
});

async function connect() {
	// Set the contract address
	const address = '0x5A56Df55e65fD92d25B7465268381162Bd60dB41';

	// Create the connection
	const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');

	// Create connection to wallet
	const wallet = new ethers.Wallet(process.env.SECRET, provider);

	// Get the Nornir contract
	const contract = new ethers.Contract(address, abi, wallet);

	// Return the contract and wallet connection
	return contract;
}

module.exports = {
	connect,
};

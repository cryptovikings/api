const abi = require('./abi/nornir.json');
const ethers = require('ethers');
const dotenvsafe = require('dotenv-safe');

dotenvsafe.config({
	path: `${__dirname}/.env`,
	example: `${__dirname}/.env.example`
});

async function connect() {
	// Set the contract address
	const address = '0x97Cbc7054cd8fe0296A3ca1F24Cdfe5047cfD39E';

	// Create the connection
	const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');

	// Create connection to wallet
	const wallet = new ethers.Wallet(process.env.SECRET, provider);

	// Get the Nornir contract
	const contract = new ethers.Contract(address, abi, wallet);

	// Return the contract and wallet connection
	return {
		contract,
		wallet,
	};
}

module.exports = {
	connect,
};

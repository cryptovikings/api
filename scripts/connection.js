const abi = require('./abi/nornir.json');
const ethers = require('ethers');
const dotenvsafe = require('dotenv-safe');

dotenvsafe.config({
	path: `${__dirname}/.env`,
	example: `${__dirname}/.env.example`
});


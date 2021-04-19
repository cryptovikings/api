const connection = require('./connection');

async function main() {
	console.log('listening...');

	const {
		contract,
		wallet,
	} = await connection.connect();

	contract.on('VikingReady', (requestId) => {
		const log = [
			'VikingReady',
			'-----------',
			'1 - The mint function has been called by a user',
			'2 - Our fulfillRandomness function has been called by VRF',
			'3 - We now have the random number stored with the index being a unique request ID',
			`4 - That request ID is: ${requestId}`,
			'5 - This listener is now going to use the request ID to call the generateViking function...',
		];

		console.log(log.join('\n'));
		contract.generateViking(requestId);
	});
}

main()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});

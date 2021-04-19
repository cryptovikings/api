const connection = require('./connection');

async function main() {
	console.log('listening...');

	const {
		contract,
		wallet,
	} = await connection.connect();

	contract.on('VikingReady', (requestId) => {
		console.log(`VikingReady - Request ID: ${requestId}`);

		console.log(log.join('\n'));
		contract.generateViking(requestId);
	});

	contract.on('VikingGenerated', (id, vikingData) => {
		console.log(`VikingGenerated: ${id}`);
		console.log(vikingData);
	});
}

main()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});

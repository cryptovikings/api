const connection = require('./connection.ts');
const BigNumber = require('ethers');

interface Viking {
	weapon: typeof BigNumber;
	attack: typeof BigNumber;
	shield: typeof BigNumber;
	defence: typeof BigNumber;
	boots: typeof BigNumber;
	speed: typeof BigNumber;
	helmet: typeof BigNumber;
	intelligence: typeof BigNumber;
	bottoms: typeof BigNumber;
	stamina: typeof BigNumber;
	appearance: typeof BigNumber;
}

async function main() {
	console.log('Listening for blockchain events...');

	const contract = await connection.connect();

	contract.on('VikingReady', (requestId: number) => {
		console.log(`VikingReady - Request ID: ${requestId}`);

		const overrides =  {
			gasPrice: 1000000000,
		};

		contract.generateViking(requestId, overrides);
	});

	contract.on('VikingGenerated', (id: number, vikingData: Viking) => {
		console.log(`VikingGenerated: ${id}`);
		console.log(vikingData);
	});
}

main()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});

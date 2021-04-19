const connection = require('./connection');

async function main() {
	console.log('listening...');

	const {
		contract,
		wallet,
	} = await connection.connect();

	const wallet = await connection.connect();
}

main()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});

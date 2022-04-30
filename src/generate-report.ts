import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as readline from 'readline';

// https://support.kraken.com/hc/en-us/articles/360001185506-How-to-interpret-asset-codes
const AssetNames = {
	'1INCH': '1inch',
	AAVE: 'Aave',
	ACA: 'Acala',
	ADA: 'Cardano',
	ALCX: 'Alchemix',
	AIR: 'Altair',
	AKT: 'Akash',
	ALGO: 'Algorand',
	ALICE: 'My Neighbor Alice',
	ANKR: 'Ankr',
	ANT: 'Aragon',
	APE: 'ApeCoin',
	ASTR: 'Astar',
	ATLAS: 'Star Atlas',
	ATOM: 'Cosmos',
	AUDIO: 'Audius',
	AVAX: 'Avalanche ',
	AXS: 'Axie Infinity',
	BADGER: 'Badger DAO',
	BAL: 'Balancer',
	BAND: 'Band Protocol',
	BAT: 'Basic Attention Token',
	BCH: 'Bitcoin Cash',
	BICO: 'Biconomy',
	BOND: 'Barnbridge',
	BNC: 'Bifrost',
	BNT: 'Bancor',
	BSV: 'Bitcoin SV',
	CHZ: 'Chiliz',
	COMP: 'Compound',
	CQT: 'Covalent',
	CRV: 'Curve',
	CTSI: 'Cartesi',
	CVX: 'Convex Finance ',
	DAI: 'Dai',
	DASH: 'DASH',
	DOT: 'Polkadot',
	DYDX: 'dYdX',
	ENJ: 'Enjin Coin',
	ENS: 'Ethereum Naming Service',
	EOS: 'EOS',
	EWT: 'Energy Web Token',
	ETH2: 'ETH2',
	FIDA: 'Bonfida',
	FIL: 'Filecoin',
	FLOW: 'Flow',
	FXS: 'Frax Share ',
	GALA: 'Gala Games',
	GARI: 'Gari Network ',
	GHST: 'Aavegotchi',
	GLMR: 'Moonbeam',
	GMT: 'STEPN',
	GNO: 'Gnosis',
	GRT: 'The Graph',
	GST: 'Green Satoshi Token ',
	ICP: 'Internet Computer',
	ICX: 'ICON',
	IMX: 'Immutable X',
	INJ: 'Injective Protocol',
	JASMY: 'Jasmy',
	KAR: 'Karura',
	KAVA: 'Kava',
	KEEP: 'Keep Network',
	KP3R: 'Keep3r Network',
	KILT: 'KILT',
	KIN: 'Kin',
	KINT: 'Kintsugi',
	KNC: 'Kyber Network',
	KSM: 'Kusama',
	LINK: 'Chainlink',
	LPT: 'Livepeer',
	LRC: 'Loopring',
	LSK: 'Lisk',
	LUNA: 'Terra',
	MANA: 'Decentraland',
	MATIC: 'Polygon',
	MASK: 'Mask Network',
	MC: 'Merit Circle',
	MINA: 'Mina',
	MIR: 'Mirror Protocol',
	MNGO: 'Mango',
	MKR: 'Maker',
	MOVR: 'Moonriver',
	MSOL: 'Marinade SOL ',
	MULTI: 'Multichain ',
	NANO: 'Nano',
	OCEAN: 'Ocean',
	OGN: 'Origin Protocol',
	OMG: 'OMG Network',
	ORCA: 'Orca',
	OXT: 'Orchid',
	OXY: 'Oxygen',
	PAXG: 'PAX Gold',
	PERP: 'Perpetual Protocol',
	PHA: 'Phala',
	PLA: 'PlayDapp ',
	POLIS: 'Star Atlas DAO',
	POWR: 'Powerledger ',
	PSTAKE: 'pSTAKE ',
	QTUM: 'QTUM',
	QNT: 'Quant ',
	RARE: 'SuperRare ',
	RARI: 'Rarible',
	RAY: 'Raydium',
	RNDR: 'Render',
	RBC: 'Rubic ',
	REN: 'REN Protocol',
	SAMO: 'Samoyed Coin ',
	SAND: 'The Sandbox',
	SBR: 'Saber',
	SC: 'Siacoin',
	SCRT: 'Secret',
	SGB: 'Songbird',
	SHIB: 'Shiba Inu',
	SDN: 'Shiden',
	SNX: 'Synthetix',
	SOL: 'Solana',
	SPELL: 'Spell Token',
	SRM: 'Serum',
	STEP: 'Step Finance',
	STEPN: 'STEPN (GMT)',
	STORJ: 'Storj',
	SUSHI: 'Sushi',
	TBTC: 'tBTC',
	TOKE: 'Tokemak ',
	TRIBE: 'Tribe',
	TRX: 'Tron',
	UMA: 'Universal Market Access',
	UNI: 'Uniswap',
	USDT: 'Tether',
	USDC: 'USD Coin',
	UST: 'TerraUSD',
	WAVE: 'Waves',
	WBTC: 'Wrapped Bitcoin',
	WOO: 'Woo Network',
	XDAO: 'DAO',
	XETC: 'Ethereum Classic',
	XETH: 'Ethereum',
	XICN: 'Iconomi',
	XLTC: 'Litecoin',
	XMLN: 'Enzyme Finance',
	XNMC: 'Namecoin',
	XREP: 'Augur',
	XREPV2: 'Augur v2',
	XRT: 'Robonomics ',
	XXBT: 'Bitcoin',
	XXDG: 'Dogecoin',
	XXLM: 'Stellar Lumens',
	XXMR: 'Monero',
	XXRP: 'Ripple',
	XXTZ: 'Tezos',
	XXVN: 'Ven',
	XZEC: 'Zcash',
	YFI: 'Yearn Finance',
	YGG: 'Yield Guild Games',
	ZRX: '0x',

	// Non-crypto currencies
	ZAUD: 'Australian Dollar',
	ZCAD: 'Canadian Dollar',
	ZCHF: 'Swiss Franc',
	ZEUR: 'Euro',
	ZGBP: 'Great British Pound',
	ZJPY: 'Japanese Yen',
	ZUSD: 'US Dollar',
	KFEE: 'Kraken Fee Credits'
} as const;

type AssetBalance = {
	transactions: {
		amount: number;
		overrideUSDCost?: number;
		ledgerRecords: [KrakenLedgerRecord, KrakenLedgerRecord];
	}[];
};

interface OutputCSV {
	From: `${typeof AssetNames[AssetCode]} (${AssetCode})` | null;
	'From Amount': number | null;
	To: `${typeof AssetNames[AssetCode]} (${AssetCode})`;
	'To Amount': number;
	// 'Purchase Date': string;
	// 'Date Sold': string;
	'Transaction Date': string;
	// 'Cost Basis': number | null;
	// Proceeds: number | null;
	'Average Cost (USD)': number | null;
}

const assetBalances: Record<AssetCode, AssetBalance> = Object.fromEntries(
	Object.keys(AssetNames).map((key) => [
		key as AssetCode,
		{ transactions: [] } as AssetBalance
	])
) as Record<AssetCode, AssetBalance>;

type AssetCode = keyof typeof AssetNames;

function getCost(records: KrakenLedgerRecord[]) {
	return records.find((r) => Number(r.amount) < 0);
}
function getGain(records: KrakenLedgerRecord[]) {
	return records.find((r) => Number(r.amount) > 0);
}

function getCostGain(records: KrakenLedgerRecord[]) {
	const costComponent = getCost(records);
	const gainComponent = getGain(records);
	if (!costComponent || !gainComponent) {
		throw Error('Missing half the transaction!');
	}
	return { costComponent, gainComponent };
}
function getAverageCost(records: KrakenLedgerRecord[]): number {
	const { costComponent, gainComponent } = getCostGain(records);

	const transaction = assetBalances[gainComponent.asset].transactions.find(
		(t) => t.ledgerRecords[0].refid === gainComponent.refid
	);

	if (!transaction) {
		throw Error('Could not find transaction!');
	}

	if (costComponent.asset === 'ZUSD') {
		return 1;
	}

	const gainBalance = assetBalances[gainComponent.asset];
	const costBalance = assetBalances[costComponent.asset];

	const relevantCostTransactions = costBalance.transactions.filter(
		(d) =>
			d.ledgerRecords[0].time <= records[0].time &&
			d.ledgerRecords[0].refid !== records[0].refid
	);

	let totalUsdCost = 0;
	let totalCostUnits = 0;
	let totalGainUnits = 0;
	for (const transaction of relevantCostTransactions) {
		const transactionGain = getGain(transaction.ledgerRecords);
		const gainUnits = Number(transactionGain!.amount);
		totalGainUnits += gainUnits;

		if (transaction.overrideUSDCost !== undefined) {
			totalUsdCost += transaction.overrideUSDCost;
			continue;
		}

		const transactionCost = getCost(transaction.ledgerRecords);

		if (transactionCost?.asset === 'ZUSD') {
			totalUsdCost += Number(transactionCost.amount);
			continue;
		}

		const costFactor = getAverageCost(transaction.ledgerRecords);
		const costUnits = Number(transactionCost!.amount);
		totalUsdCost += costFactor * costUnits;
		totalCostUnits += costUnits;
	}

	return totalUsdCost / totalGainUnits;
}

interface KrakenLedgerRecord {
	refid: string;
	time: string;
	type: 'deposit' | 'trade' | 'spend' | 'receive' | 'withdrawal';
	aclass: 'currency';
	asset: AssetCode | 'ZUSD';
	amount: string;
	fee: string;
	txid?: string;
	balance: string;
}

const [, , inputFilePath, outputPath] = process.argv;

if (!inputFilePath) {
	throw Error('Input file path not specified!');
}
if (!outputPath) {
	throw Error('Output file path not specified!');
}

const lineReader = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true
});

function promptUser(prompt: string): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			lineReader.question(prompt, (answer) => resolve(answer));
		} catch (e) {
			reject(e);
		}
	});
}

async function execute() {
	const file = xlsx.readFile(inputFilePath, { raw: true });
	const records: KrakenLedgerRecord[] = xlsx.utils.sheet_to_json(
		file.Sheets[file.SheetNames[0]]
	);

	const transactions = new Map<string, KrakenLedgerRecord[]>();

	for (const record of records) {
		if (!transactions.has(record.refid)) {
			transactions.set(record.refid, []);
		}
		transactions.get(record.refid)?.push(record);
	}

	const mappedRecords: OutputCSV[] = [];

	for (const [refid, transactionRecords] of [...transactions.entries()].sort(
		(a, b) => (a[1][0].time < b[1][0].time ? -1 : 1)
	)) {
		if (transactionRecords.length !== 2) {
			throw Error(
				`Expected a transaction length of 2 for transaction "${refid}".`
			);
		}

		let costComponent = transactionRecords.find(
			(r) => Number(r.amount) < 0
		);
		let gainComponent = transactionRecords.find(
			(r) => Number(r.amount) > 0
		);

		if (!costComponent || !gainComponent) {
			if (gainComponent?.type === 'deposit') {
				gainComponent = transactionRecords.find((r) => !r.txid?.trim());
				if (!gainComponent) {
					throw Error('Could not find proper gain component!');
				}

				let userInputAverageSpent = NaN;
				while (isNaN(userInputAverageSpent)) {
					userInputAverageSpent = Number(
						(await promptUser(
							`For the deposit with refid "${
								gainComponent.refid
							}", please enter the average amount spent on the deposited ${
								AssetNames[gainComponent.asset]
							} amount of ${gainComponent.amount}: `
						)) ?? NaN
					);

					if (userInputAverageSpent === NaN) {
						console.error('Provided value was not a number!s');
					}
				}

				assetBalances[gainComponent.asset].transactions.push({
					amount: Number(gainComponent.amount),
					// TODO: override cost with user input.
					overrideUSDCost: userInputAverageSpent,
					ledgerRecords: [
						transactionRecords[0],
						transactionRecords[1]
					]
				});

				mappedRecords.push({
					From: null,
					'From Amount': null,
					To: `${AssetNames[gainComponent.asset]} (${
						gainComponent.asset
					})`,
					'To Amount': Number(gainComponent.amount),

					'Transaction Date': gainComponent.time,

					'Average Cost (USD)': userInputAverageSpent
				});
				continue;
			} else if (costComponent?.type === 'withdrawal') {
				costComponent = transactionRecords.find((r) => !r.txid?.trim());
				if (!costComponent) {
					throw Error('Could not find proper gain component!');
				}
				assetBalances[costComponent.asset].transactions.push({
					amount: Number(costComponent.amount),
					ledgerRecords: [
						transactionRecords[0],
						transactionRecords[1]
					]
				});
				continue;
			} else {
				throw Error('Missing half the transaction!');
			}
		}

		const gainBalance = assetBalances[gainComponent.asset];
		const costBalance = assetBalances[costComponent.asset];

		gainBalance.transactions.push({
			amount: Number(gainComponent.amount),
			overrideUSDCost:
				costComponent.asset === 'ZUSD'
					? Number(costComponent.amount)
					: undefined,
			ledgerRecords: [transactionRecords[0], transactionRecords[1]]
		});

		costBalance.transactions.push({
			amount: Number(costComponent.amount),
			ledgerRecords: [transactionRecords[0], transactionRecords[1]]
		});

		mappedRecords.push({
			From: `${AssetNames[costComponent.asset]} (${costComponent.asset})`,
			'From Amount': Number(costComponent.amount),
			To: `${AssetNames[gainComponent.asset]} (${gainComponent.asset})`,
			'To Amount': Number(gainComponent.amount),

			'Transaction Date': gainComponent.time,

			'Average Cost (USD)':
				getAverageCost(transactionRecords) *
				Number(costComponent.amount)
		});
	}

	const csv = xlsx.utils.sheet_to_csv(
		xlsx.utils.json_to_sheet(mappedRecords)
	);

	fs.writeFileSync(outputPath, csv);
	console.log('Done');

	lineReader.close();
}

void execute();

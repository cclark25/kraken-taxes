import * as xlsx from 'xlsx';
import * as fs from 'fs';

// https://support.kraken.com/hc/en-us/articles/360001185506-How-to-interpret-asset-codes
const CryptoNames = {
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
	ZRX: '0x'
} as const;

type CryptoCode = keyof typeof CryptoNames;

interface KrakenLedgerRecord {
	refid: string;
	time: string;
	type: 'deposit' | 'trade' | 'spend' | 'receive' | 'withdrawal';
	aclass: 'currency';
	asset: CryptoCode | 'ZUSD';
	amount: string;
	fee: string;
	txid: string;
	balance: string;
}

const [, , inputFilePath, outputPath] = process.argv;

if (!inputFilePath) {
	throw Error('Input file path not specified!');
}
if (!outputPath) {
	throw Error('Output file path not specified!');
}

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

const mappedRecords = [...transactions.entries()].flatMap(
	([refid, transactionRecords]) => {
		if (transactionRecords.length !== 2) {
			throw Error(
				`Expected a transaction length of 2 for transaction "${refid}".`
			);
		}

		const cryptoComponent: KrakenLedgerRecord | undefined =
			transactionRecords.find((r) => r.asset !== 'ZUSD');
		const usdComponent: KrakenLedgerRecord | undefined =
			transactionRecords.find((r) => r.asset === 'ZUSD');

		if (!usdComponent) {
			return [];
		}
		if (!cryptoComponent) {
			throw Error(`Expected cryptocurrency in transaction "${refid}".`);
		}

		if (!CryptoNames[cryptoComponent.asset as CryptoCode]) {
			throw Error(`Unrecognized asset "${cryptoComponent.asset}".`);
		}

		return {
			'Cryptocurrency Code': cryptoComponent.asset,
			'Cryptocurrency Name':
				CryptoNames[cryptoComponent.asset as CryptoCode],
			'Cryptocurrency Amount': cryptoComponent.amount,
			'Purchase Date':
				Number(cryptoComponent.amount) > 0
					? cryptoComponent.time
					: null,
			'Date Sold':
				Number(usdComponent.amount) > 0 ? usdComponent.time : null,
			'Cost Basis':
				Number(cryptoComponent.amount) > 0 ? usdComponent.amount : null,
			Proceeds:
				Number(usdComponent.amount) > 0 ? usdComponent.amount : null
		};
	}
);

const csv = xlsx.utils.sheet_to_csv(xlsx.utils.json_to_sheet(mappedRecords));

fs.writeFileSync(outputPath, csv);
console.log('Done');

const CHAIN_ID_BSC = 'bsc'
const CAHIN_ID_MAINNET = 'ethereum'

const DEX_ID_UNISWAP = 'uniswap'
const DEX_ID_PANCAKESWAP = 'pancakeswap'

const CHAINS = {
  'bsc': {
    'uniswap': {
      '2': {
        FactoryAddress: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
        RouterAddress: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',

        FactoryAbi: require('./abi/UniswapV2Factory.json'),
        RouterAbi: require('./abi/UniswapV2Router.json'),
        PairAbi: require('./abi/UniswapV2Pair.json'),
      },
      '3': {
        FactoryAddress: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
        RouterAddress: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2',
        QuoterAddress: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',

        FactoryAbi: require('./abi/UniswapV3Factory.json'),
        RouterAbi: require('./abi/UniswapV3Router.json'),
        QuoterAbi: require('./abi/UniswapV3Quoter.json'),
        PairAbi: require('./abi/UniswapV3Pair.json'),
      },
    },

    'pancakeswap': {
      '2': {
        FactoryAddress: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        RouterAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',

        FactoryAbi: require('./abi/PancakeswapV2Factory.json'),
        RouterAbi: require('./abi/PancakeswapV2Router.json'),
        PairAbi: require('./abi/PancakeswapV2Pair.json'),
      },
      '3': {
        FactoryAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
        RouterAddress: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
        QuoterAddress: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',

        FactoryAbi: require('./abi/PancakeswapV3Factory.json'),
        RouterAbi: require('./abi/PancakeswapV3Router.json'),
        QuoterAbi: require('./abi/PancakeswapV3Quoter.json'),
        PairAbi: require('./abi/PancakeswapV3Pair.json'),
      },
    },

		USDTAddress: "0x55d398326f99059fF775485246999027B3197955",
		WETHAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",

		USDTDecimals: 18,
		WETHDecimals: 18,
  }
}


module.exports = {
  CHAIN_ID_BSC,
  CAHIN_ID_MAINNET,

  DEX_ID_UNISWAP,
  DEX_ID_PANCAKESWAP,

  CHAINS,
}
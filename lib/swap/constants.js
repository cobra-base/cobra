const CHAIN_ID_BSC = 'bsc'
const CAHIN_ID_MAINNET = 'ethereum'

const CHAIN_INFO = {
  CHAIN_ID_BSC: {
    UniswapV2FactoryAddress: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
		UniswapV2RouterAddress:  "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
		UniswapV3FactoryAddress: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
		UniswapV3RouterAddress:  "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
		UniswapV3QuoterAddress:  "0x78D78E420Da98ad378D7799bE8f4AF69033EB077",

		PancakeswapV2FactoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
		PancakeswapV2RouterAddress:  "0x10ED43C718714eb63d5aA57B78B54704E256024E",
		PancakeswapV3FactoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
		PancakeswapV3RouterAddress:  "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
		PancakeswapV3QuoterAddress:  "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",

		USDTAddress: "0x55d398326f99059fF775485246999027B3197955",
		WETHAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  }
}

const PancakeswapV2RouterAbi = require('./abi/PancakeswapV2Router.json')
const PancakeswapV3RouterAbi = require('./abi/PancakeswapV3Router.json')
const PancakeswapV3QuoterAbi = require('./abi/PancakeswapV3Quoter.json')

const UniswapV2RouterAbi = require('./abi/UniswapV2Router.json')
const UniswapV3RouterAbi = require('./abi/UniswapV3Router.json')
const UniswapV3QuoterAbi = require('./abi/UniswapV3Quoter.json')

module.exports = {
  CHAIN_ID_BSC,
  CAHIN_ID_MAINNET,

  CHAIN_INFO,

  PancakeswapV2RouterAbi,
  PancakeswapV3RouterAbi,
  PancakeswapV3QuoterAbi,

  UniswapV2RouterAbi,
  UniswapV3RouterAbi,
  UniswapV3QuoterAbi,
}
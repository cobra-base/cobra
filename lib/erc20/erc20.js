const {ethers} = require('ethers') 

const log = require('../util/log')

const addr0 = "0x" + "0".repeat(40);
const erc20Abi = require('./erc20.json')
const wethAbi = require('./weth.json')

const deployments = {
  ETH_Mainnet: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
}
 
function toBN(v) {
  return ethers.BigNumber.from(v.toString())
}

function getPrivateKeyFromMnemonic(mnemonic, idx) {
  let basePath = "m/44'/60'/0'/0"; 
  let w = ethers.Wallet.fromMnemonic(mnemonic, basePath + "/" + idx)
  return w.privateKey
}

function getAddressFromMnemonic(mnemonic, idx) {
  let basePath = "m/44'/60'/0'/0"; 
  let w = ethers.Wallet.fromMnemonic(mnemonic, basePath + "/" + idx)
  return w.address
}

function getSingerFromMnemonic(mnemonic, idx, provider) {
  let privateKey = getPrivateKeyFromMnemonic(mnemonic, idx)
  let signer = new ethers.Wallet(privateKey).connect(provider)
  return signer
}

async function getNativeBalanceOf(user, provider) {
  return await provider.getBalance(user)
}

async function getErc20BalanceOf(address, user, provider) {
  let contract = new ethers.Contract(address, erc20Abi, provider)
  return await contract.balanceOf(user)
}
 
async function getErc20Name(address, provider) {
	let contract = new ethers.Contract(address, erc20Abi, provider)
	return await contract.name()
}

async function getErc20Symbol(address, provider) {
	let contract = new ethers.Contract(address, erc20Abi, provider)
	return await contract.symbol()
}

async function getErc20Decimals(address, provider) {
	let contract = new ethers.Contract(address, erc20Abi, provider)
	return await contract.decimals()
}

async function getErc20TotalSupply(address, provider) {
	let contract = new ethers.Contract(address, erc20Abi, provider)
	return await contract.totalSupply()
}

function fromReadableAmount(amount, decimals) {
  return ethers.utils.parseUnits(amount.toString(), decimals)
}

function toReadableAmount(rawAmount, decimals) {
  return ethers.utils.formatUnits(rawAmount, decimals)
}

function toFriendlyAmount(rawAmount, decimals, precision) {
  let s = ethers.utils.formatUnits(rawAmount, decimals)
  let i = s.indexOf('.')
  if (i < 0) {
    return s
  }
  return s.substr(0, i + precision + 1)
}

function isValidAddress(addr) { 
  return ethers.utils.isAddress(addr)
}

function isZeroAddress(addr) {
  return addr.toUpperCase() == addr0.toUpperCase()
}

async function approveMax(signer, spender, tokenAddress, gasPrice) { 
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer)  
  const allowAmount = await tokenContract.allowance(signer.address, spender)
  log.debug(`token allowance,owner ${signer.address},spender ${spender},contractAddr ${tokenAddress},allowance ${ethers.utils.formatUnits(allowAmount, "ether")}`)
  const enoughAmount = ethers.utils.parseEther(Number.MAX_SAFE_INTEGER.toString())
  if (allowAmount.lt(enoughAmount.div(10))) {
    log.debug(`token approve start,address ${signer.address},spender ${spender}`)
    const tx = await tokenContract.approve(spender, enoughAmount, {gasPrice: gasPrice})
    let gasGwei = ethers.utils.formatUnits(gasPrice, "gwei")
    log.debug(`token approve wait,owner ${signer.address},spender ${spender},wait txHash at ${tx.hash},nonce ${tx.nonce},gasPrice ${gasGwei} gwei`)
    await tx.wait()
    log.debug(`token approve complete,owner ${signer.address},spender ${spender},txHash at ${tx.hash}`)
  }  
}

module.exports = {
  addr0,
  erc20Abi,
  wethAbi,
  
  deployments,
  
  getPrivateKeyFromMnemonic,
  getAddressFromMnemonic,
  getSingerFromMnemonic,
      
  getNativeBalanceOf,
  getErc20BalanceOf,
  
  getErc20Name,
  getErc20Symbol,
  getErc20Decimals,
  getErc20TotalSupply,

  isZeroAddress,
  isValidAddress,

  fromReadableAmount,
  toReadableAmount,
  toFriendlyAmount,
  
  approveMax,
}


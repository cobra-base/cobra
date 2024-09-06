const {ethers} = require('ethers') 
const cobra = require('../../')

const addr0 = "0x" + "0".repeat(40);
const erc20Abi = require('./erc20.json')
const wethAbi = require('./weth.json')
 
function toBN(v) {
  return ethers.BigNumber.from(v.toString())
}

async function getNativeBalanceOf(user, provider) {
  return await provider.getBalance(user)
}

async function getErc20BalanceOf(address, user, provider) {
  let contract = new ethers.Contract(address, erc20ABI, provider)
  return await contract.balanceOf(user)
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

async function approveMax(signer, spender, tokenAddress, gasPrice) { 
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer)  
  const allowAmount = await tokenContract.allowance(signer.address, spender)
  console.log(cobra.time.nowS(), `token allowance,owner ${signer.address},spender ${spender},contractAddr ${tokenAddress},allowance ${ethers.utils.formatUnits(allowAmount, "ether")}`)
  const enoughAmount = ethers.utils.parseEther(Number.MAX_SAFE_INTEGER.toString())
  if (allowAmount.lt(enoughAmount.div(10))) {
    console.log(cobra.time.nowS(), `token approve start,address ${signer.address},spender ${spender}`)
    const tx = await tokenContract.approve(spender, enoughAmount, {gasPrice: gasPrice})
    let gasGwei = ethers.utils.formatUnits(gasPrice, "gwei")
    console.log(cobra.time.nowS(), `token approve wait ,owner ${signer.address},spender ${spender},wait txHash at ${tx.hash},nonce ${tx.nonce},gasPrice ${gasGwei} gwei`)
    await tx.wait()
    console.log(cobra.time.nowS(), `token approve complete,owner ${signer.address},spender ${spender},txHash at ${tx.hash}`)
  }  
}

module.exports = {
  addr0,
  erc20Abi,
  wethAbi,
    
  getNativeBalanceOf,
  getErc20BalanceOf,
    
  getPrivateKeyFromMnemonic,
  getAddressFromMnemonic,
  getSingerFromMnemonic,
  
  approveMax,
}


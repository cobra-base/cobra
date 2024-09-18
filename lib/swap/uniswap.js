const {ethers} = require('ethers') 
const cobra = require('../../')

artifacts = {
  V3SwapRouter02: require("@uniswap/swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json"),
} 
 
async function swap(signer, router02, tokenIn, tokenOut, amountIn, amountOut, fee, params) {    
  let gasPrice = params.gasPrice
  let gasLimit = params.gasLimit
  let nonce = params.nonce
  let value = params.value

  if (nonce == undefined) { // must skip approve, because nonce cant be changed
    await cobra.erc20.approveMax(signer, router02, tokenIn, gasPrice)
  }

  let amountInS = ethers.utils.formatUnits(amountIn, "ether")
  let amountOutS = ethers.utils.formatUnits(amountOut, "ether")
  let gasGwei = ethers.utils.formatUnits(gasPrice, "gwei")

  console.log(cobra.time.nowS(), `uniSwap tokenIn ${tokenIn},tokenOut ${tokenOut},AmountIn ${amountInS},amountOut ${amountOutS},gasPrice ${gasGwei} gwei`)
  const swapRouter02 = new ethers.Contract(router02, artifacts.V3SwapRouter02.abi, signer)
  let tx = await swapRouter02.exactInputSingle({
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: fee,   // 10000
    recipient: signer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 5,
    amountIn: amountIn,
    amountOutMinimum: amountOut,
    sqrtPriceLimitX96: 0,
  }, { value: value, gasPrice: gasPrice, gasLimit: gasLimit, nonce: nonce})
  console.log(cobra.time.nowS(), `uniSwap tx wait at ${tx.hash},address ${signer.address}`)
  await tx.wait()
  console.log(cobra.time.nowS(), `uniSwap tx complete at ${tx.hash},address ${signer.address}`)
}

module.exports = { 
	artifacts,
	
  swap,
}

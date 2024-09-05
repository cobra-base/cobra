const {ethers} = require('ethers') 
const swapRouter02Abi = require("@uniswap/swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json")
const cobra = require('../../')

const swapRouter02_ETH = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'

async function swap(signer, router02, tokenIn, tokenOut, amountIn, amountOut, fee, gasPrice) {    
  await cobra.erc20.approveMax(signer, router02, tokenIn, gasPrice)

  let amountInS = ethers.utils.formatUnits(amountIn, "ether")
  let amountOutS = ethers.utils.formatUnits(amountOut, "ether")
  let gasGwei = ethers.utils.formatUnits(gasPrice, "gwei")

  console.log(cobra.time.nowS(), `uniSwap tokenIn ${tokenIn},tokenOut ${tokenOut},AmountIn ${amountInS},amountOut ${amountOutS},gasPrice ${gasGwei} gwei`)
  const swapRouter02 = new ethers.Contract(router02, swapRouter02Abi.abi, signer)
  let tx = await swapRouter02.exactInputSingle({
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: fee,   // 10000
    recipient: signer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 5,
    amountIn: amountIn,
    amountOutMinimum: amountOut,
    sqrtPriceLimitX96: 0,
  }, { gasPrice: gasPrice, gasLimit: 3000000})
  console.log(cobra.time.nowS(), `uniSwap tx wait at ${tx.hash},address ${signer.address}`)
  await tx.wait()
  console.log(cobra.time.nowS(), `uniSwap tx complete at ${tx.hash},address ${signer.address}`)
}

module.exports = {
	swapRouter02_ETH,
	
  swap,
}

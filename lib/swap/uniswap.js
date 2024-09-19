const {ethers} = require('ethers') 
const cobra = require('../../')

const artifacts = {
  IUniswapV2Factory: require('@uniswap/v2-core/build/IUniswapV2Factory.json'),
  IUniswapV2Pair: require('@uniswap/v2-core/build/IUniswapV2Pair.json'),
  IUniswapV2Router02: require('@uniswap/v2-periphery/build/IUniswapV2Router02.json'),
  
  QuoterV2: require('@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'),
  IUniswapV3Factory: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'),
  IUniswapV3Pool: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'),

  swapRouter02: require("@uniswap/swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json"),
} 

const deployments = {
  ETH_Mainnet: {
    V3QuoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    V3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    
    SwapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  },
}

// handle erc20 token decimal by caller, and only support uniswap v3
async function v3_quoteExactInputSingle(provider, quoterV2Address, tokenIn, tokenOut, amountIn, sqrtPriceLimitX96, fee) {
  const quoterV2 = new ethers.Contract(quoterV2Address, artifacts.QuoterV2.abi, provider)
  const params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amountIn: amountIn,
    fee: fee,
    sqrtPriceLimitX96: sqrtPriceLimitX96,
  }
  const quoterRet = await quoterV2.callStatic.quoteExactInputSingle(params)
  return quoterRet
}

// handle erc20 token decimal by caller, and only support uniswap v3
async function v3_quoteExactOutputSingle(provider, quoterV2Address, tokenIn, tokenOut, amountOut, sqrtPriceLimitX96, fee) {
  const quoterV2 = new ethers.Contract(quoterV2Address, artifacts.QuoterV2.abi, provider)
  const params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amount: amountOut,
    fee: fee,
    sqrtPriceLimitX96: sqrtPriceLimitX96,
  }
  const quoterRet = await quoterV2.callStatic.quoteExactOutputSingle(params)
  return  quoterRet
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
  const router = new ethers.Contract(router02, artifacts.swapRouter02.abi, signer)
  let tx = await router.exactInputSingle({
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
	deployments,
	
	v3_quoteExactInputSingle,
	v3_quoteExactOutputSingle,
	
  swap,
}

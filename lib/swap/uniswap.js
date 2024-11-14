const {ethers} = require('ethers') 
const { ChainId, WETH9, V2_FACTORY_ADDRESSES, V3_CORE_FACTORY_ADDRESSES, SWAP_ROUTER_02_ADDRESSES, } = require('@uniswap/sdk-core')
const { INIT_CODE_HASH } = require('@uniswap/v2-sdk')
const { pack, keccak256 } = require('@ethersproject/solidity')
const { getCreate2Address } = require('@ethersproject/address')

const cobra = require('../../')

const artifacts = {
  // V2
  IUniswapV2Factory: require('@uniswap/v2-core/build/IUniswapV2Factory.json'),
  IUniswapV2Pair: require('@uniswap/v2-core/build/IUniswapV2Pair.json'),
  IUniswapV2Router02: require('@uniswap/v2-periphery/build/IUniswapV2Router02.json'),
  
  // V3
  V3QuoterV2: require('@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'),
  V3SwapRouter: require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'),
  IUniswapV3Factory: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'),
  IUniswapV3Pool: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'),

  // V2 & V3
  swapRouter02: require("@uniswap/swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json"),
} 

const deployments = {
  ETH_Mainnet: {
    V3Factory: V3_CORE_FACTORY_ADDRESSES[ChainId.MAINNET],
    V3QuoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    V3SwapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    
    // v2 & v3
    SwapRouter02: SWAP_ROUTER_02_ADDRESSES[ChainId.MAINNET],
  },
}

function getWETH9(chainId) {
  return WETH9[chainId].address
}

function v2_getPairAddress(factoryAddress, tokenA, tokenB) {
  let token0 = tokenA
  let token1 = tokenB
  if (ethers.BigNumber.from(tokenA).gt(ethers.BigNumber.from(tokenB))) {
    token0 = tokenB
    token1 = tokenA
  }
  let pair = getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
    INIT_CODE_HASH
  )
  return pair
}

async function v2_reserves(provider, factoryAddress, tokenA, tokenB) {
  let addr = v2_getPairAddress(factoryAddress, tokenA, tokenB)
  let pair = new ethers.Contract(addr, artifacts.IUniswapV2Pair.abi, provider)
  let amounts = await pair.getReserves()
  if (ethers.BigNumber.from(tokenA).gt(ethers.BigNumber.from(tokenB))) {
    return [amounts.reserve1, amounts.reserve0]
  }
  return [amounts.reserve0, amounts.reserve1]
}

function v2_getAmountOut(amountIn, reserveIn, reserveOut) {
  if (amountIn.isZero()) {
    return [ethers.BigNumber.from(0), reserveIn, reserveOut]
  }

  let amountInWithFee = amountIn.mul(997)
  let numerator = amountInWithFee.mul(reserveOut)
  let denominator = amountInWithFee.add(reserveIn.mul(1000))
  let amountOut = numerator.div(denominator)
  
  let newReserveOut = reserveOut.sub(amountOut)
  if (newReserveOut.lt(0) || newReserveOut.gt(reserveOut)) {
    newReserveOut = ethers.constants.One        // Underflow
  }
  
  let newReserveIn = reserveIn.add(amountIn)
  if (newReserveIn.lt(reserveIn)) {
    newReserveIn = ethers.constants.MaxInt256   // Overflow
  }
  
  return [amountOut, newReserveIn, newReserveOut]
}

function v2_getAmountIn(amountOut, reserveIn, reserveOut) {
  if (amountOut.isZero()) {
    return [ethers.BigNumber.from(0), reserveIn, reserveOut]
  }

  let newReserveOut = reserveOut.sub(amountOut) 
  if (amountOut.gte(reserveOut)) {
    newReserveOut = ethers.constants.One  // Underflow  
  } 
  
  let numerator = reserveIn.mul(amountOut).mul(1000);
  let denominator = newReserveOut.mul(997);
  let amountIn = numerator.div(denominator).add(ethers.constants.One);
  
  let newReserveIn = reserveIn.add(amountIn);
  if (newReserveIn.lt(reserveIn)) {
    newReserveIn = ethers.constants.MaxInt256;  // Overflow
  }
  
  return [amountIn, newReserveIn, newReserveOut]
}

/**
 * 从链上查询兑换价格，只适用UNISWAP V2
 * Example
 *  let usdt = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
 *  let weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
 *  let pepe = '0x6982508145454Ce325dDbE47a25d4ec3d2311933'
 *  let path = [usdt, weth, pepe]
 *  let amountIn = cobra.erc20.fromReadableAmount(1000, 6) 
 * return
 *  [
 *    BigNumber { _hex: '0x3b9aca00', _isBigNumber: true },
 *    BigNumber { _hex: '0x04557740b1b78647', _isBigNumber: true },
 *    BigNumber { _hex: '0x204bba69a76ad74bd52e3c', _isBigNumber: true }
 *  ]
 */
async function v2_getAmountsOut_remote(provider, v2Router02Addr, amountIn, path) {
  const router = new ethers.Contract(v2Router02Addr, artifacts.IUniswapV2Router02.abi, provider)
  let amountsOut = await router.getAmountsOut(amountIn, path)
  return amountsOut
}

async function v2_getAmountsIn_remote(provider, v2Router02, amountOut, path) {
  const router = new ethers.Contract(v2Router02, artifacts.IUniswapV2Router02.abi, provider)
  let amountsIn= await router.getAmountsIn(amountOut, path)
  return amountsIn
}

/**
 * 兑换，只支持UNISWAP V2, 注意调用前需要approve
 */
async function v2_swapExactTokensForTokens(signer, router02Addr, path, amountIn, amountOutMin, recipient, overrideParams) {
  let router02 = new ethers.Contract(router02Addr, artifacts.swapRouter02.abi, signer) 
  let tx = router02.swapExactTokensForTokens(amountIn, amountOutMin, path, recipient, overrideParams)
  log.info(`v2 swapExactTokensForTokens wait at ${tx.hash}`)
  await tx.wait()
  log.info(`v3 swapExactTokensForTokens complete at ${tx.hash}`)
  return tx.hash
}
 
function binarySearchBestIn(left, right, tolerance, calcF, passF) {
  let mid = right.add(left).div(2)
  if (right.sub(left).gt(tolerance)) {
    let amountOut = calcF(mid)
    if (passF(amountOut)) {
      return binarySearchBestIn(mid, right, tolerance, calcF, passF)
    } else {
      return binarySearchBestIn(left, mid, tolerance, calcF, passF)
    }
  }
  
  // let amountOut = calcF(mid)
  let amountOut = calcF(left)
  if (passF(amountOut)) {
    return left  
  }
  
  // Not found
  return ethers.constants.Zero
}

function v2_calcSandwichBestInForExactIn(lowerBound, upperBound, tolerance, victimAmountIn, victimAmountOutMin, reserveIn, reserveOut) {
  let calcF = (amountIn) => {
    let [beforeAmountOut, beforeReserveIn, beforeReserveOut] = v2_getAmountOut(amountIn, reserveIn, reserveOut)
    let [victimAmountOut, victimReserveIn, victimReserveOut] = v2_getAmountOut(victimAmountIn, beforeReserveIn, beforeReserveOut)
    return victimAmountOut
  } 
  let passF = (amountOut) => amountOut.gte(victimAmountOutMin)
  let bestIn = binarySearchBestIn(lowerBound, upperBound, tolerance, calcF, passF)
  return bestIn
}

function v2_calcSandwichBestInForExactOut(lowerBound, upperBound, tolerance, victimAmountInMax, victimAmountOut, reserveIn, reserveOut) {
  let calcF = (amountIn) => {
  	let [beforeAmountOut, beforeReserveIn, beforeReserveOut] = v2_getAmountOut(amountIn, reserveIn, reserveOut)
  	let [victimAmountIn, victimReserveIn, victimReserveOut] = v2_getAmountIn(victimAmountOut, beforeReserveIn, beforeReserveOut)
  	return victimAmountIn
  }  
  let passF = (amountIn) => amountIn.lte(victimAmountInMax)
  let bestIn = binarySearchBestIn(lowerBound, upperBound, tolerance, calcF, passF)
  return bestIn
}

/*
  // example
  async function main() {
  let amountIn = ethers.utils.parseEther('10000')
  let amountOutMin = ethers.utils.parseEther('4950')
  let reserveA = ethers.utils.parseEther('10000')
  let reserveB = ethers.utils.parseEther('10000')
  
  let lowerBound = ethers.utils.parseEther('0.001')
  let upperBound = ethers.utils.parseEther('10000')
  let tolerance = ethers.utils.parseEther('0.0001')
  
  let bestIn = v2_calcSandwichBestInForExactIn(lowerBound, upperBound, tolerance, amountIn, amountOutMin, reserveA, reserveB)
  console.log(ethers.utils.formatEther(bestIn))
  let [oneAmountOut, oneReserveA, oneReserveB] = v2_getAmountOut(bestIn, reserveA, reserveB)
  let [twoAmountOut, twoReserveA, twoReserveB] = v2_getAmountOut(amountIn, oneReserveA, oneReserveB)
  let [threeAmountOut, threeReserveB, threeReserveA] = v2_getAmountOut(oneAmountOut, twoReserveB, twoReserveA)
  console.log(ethers.utils.formatEther(threeAmountOut))
  
  
  {
	  let amountInMax = ethers.utils.parseEther('10000')
	  let amountOut = ethers.utils.parseEther('4950')
	  bestIn = v2_calcSandwichBestInForExactOut(lowerBound, upperBound, tolerance, amountInMax, amountOut, reserveA, reserveB)
	  console.log(ethers.utils.formatEther(bestIn))
	 
	 	let [oneAmountOut, oneReserveA, oneReserveB] = v2_getAmountOut(bestIn, reserveA, reserveB)
	  let [twoAmountOut, twoReserveA, twoReserveB] = v2_getAmountIn(amountOut, oneReserveA, oneReserveB)
	  let [threeAmountOut, threeReserveB, threeReserveA] = v2_getAmountOut(oneAmountOut, twoReserveB, twoReserveA)
	  console.log(ethers.utils.formatEther(threeAmountOut))
	} 
  }

  main();
*/

/**
 * 查询交易池费率, 只适用UNISWAP V3
 * Return :
 *  500     0.05%
 *  10000   1%
 */
async function v3_getFee(provider, pair) {
  let pool = new ethers.Contract(pair, artifacts.IUniswapV3Pool.abi, provider)
  let fee = await pool.fee()
  return fee
}  
 
/**
  兑换价格查询，只适用UNISWAP V3,支持任意路径
  Example
  
  	let usdt = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    let weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    let tokenIn = '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB'
  
    let types = ['address', 'uint24', 'address', 'uint24', 'address']
    let params = [usdt, 500, weth, 10000, tokenIn]
  
    let path = ethers.utils.solidityPack(types, params) 
    await cobra.uniswap.v3_quoteExactInput(appCtx.provider, cobra.uniswap.deployments.ETH_Mainnet.V3QuoterV2, path, amountIn)
  Return:
    [
      BigNumber { _hex: '0x8fd5b502b7d39efbd5', _isBigNumber: true },
      [
        BigNumber { _hex: '0x03b61884d4e68bf6661ff0', _isBigNumber: true },
        BigNumber {
          _hex: '0x5caaffb56f66aa7b367732dffe',
          _isBigNumber: true
        }
      ],
      [ 0, 0 ],
      BigNumber { _hex: '0x027300', _isBigNumber: true },
      amountOut: BigNumber { _hex: '0x8fd5b502b7d39efbd5', _isBigNumber: true },
      sqrtPriceX96AfterList: [
        BigNumber { _hex: '0x03b61884d4e68bf6661ff0', _isBigNumber: true },
        BigNumber {
          _hex: '0x5caaffb56f66aa7b367732dffe',
          _isBigNumber: true
        }
      ],
      initializedTicksCrossedList: [ 0, 0 ],
      gasEstimate: BigNumber { _hex: '0x027300', _isBigNumber: true }
    ]  
*/  
async function v3_quoteExactInput(provider, quoterV2Addr, quotePath, amountIn) {
	let quoter = new ethers.Contract(quoterV2Addr, artifacts.V3QuoterV2.abi, provider)
	let retVal = await quoter.callStatic.quoteExactInput(quotePath, amountIn)
	return retVal
}

/**
 * 兑换，只支持UNISWAP V3, 注意调用前需要approve
 * Return 链上事务HASH
 */
async function v3_exactInput(signer, router02, path, recipient, amountIn, amountOutMin, deadline, overrideParams) { 
  let router02 = new ethers.Contract(router02, artifacts.swapRouter02.abi, signer) 
  let params = {
    'path': path,
    'recipient': recipient,
    'amountIn': amountIn,
    'amountOutMinimum': amountOutMin,
    'deadline': deadline,
  }
  let tx = await router02.exactInput(params, overrideParams)
  log.info(`v3 exactInput wait at ${tx.hash}`)
  await tx.wait()
  log.info(`v3 exactInput complete at ${tx.hash}`)
  return tx.hash
}

	
// handle erc20 token decimal by caller, and only support uniswap v3
async function v3_quoteExactInputSingle(provider, quoterV2Address, tokenIn, tokenOut, amountIn, sqrtPriceLimitX96, fee) {
  const quoterV2 = new ethers.Contract(quoterV2Address, artifacts.V3QuoterV2.abi, provider)
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
  const quoterV2 = new ethers.Contract(quoterV2Address, artifacts.V3QuoterV2.abi, provider)
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

  getWETH9,
  
  // V2
  
  v2_getPairAddress,
  v2_reserves,
  v2_calcSandwichBestInForExactIn,
  v2_calcSandwichBestInForExactOut,

  v2_getAmountOut, 
  v2_getAmountIn,

  v2_getAmountsOut_remote,
  v2_getAmountsIn_remote,

  v2_swapExactTokensForTokens,
  
  // V3
  
  v3_getFee,
  
  v3_quoteExactInputSingle,
  v3_quoteExactOutputSingle,
  
  v3_quoteExactInput,
  v3_exactInput,
  
  swap,
}

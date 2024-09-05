'use strict'

const time = require('./lib/util/time')
const rand = require('./lib/util/rand')
const erc20 = require('./lib/erc20/erc20')
const uniswap = require('./lib/swap/uniswap')

module.exports.time = time
module.exports.rand = rand
module.exports.erc20 = erc20
module.exports.uniswap = uniswap

module.exports.putMsg = function() {
    console.warn('Great! you got')
}
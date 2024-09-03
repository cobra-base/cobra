'use strict'

const time = require('./lib/util/time')
const rand = require('./lib/util/rand')

module.exports.time = time
module.exports.rand = rand

module.exports.putMsg = function() {
    console.warn('Great! you got')
}
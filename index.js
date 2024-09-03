const time = require('./lib/util/time')
const rand = require('./lib/util/rand')

module.exports.util = {
    time: time,
    rand: rand,
}

module.exports.putMsg = function() {
    console.warn('Great! you got')
}
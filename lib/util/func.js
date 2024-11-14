const needle = require('needle')
const fs = require('fs')
const log = require('../util/log')

function isAlpha(c) {
  let charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (charset.indexOf(c) != -1) {
    return true
  }
  return false
}

function stringToHex(str) {
  const val = [...str].map(c => c.charCodeAt(0).toString(16).padStart(2, 0)).join``
  return '0x' + val;
}

function randString() {
  let r = ''
  let s = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  for (let i = 0; i < 12; i++) {
    let j = Math.floor(Math.random() * s.length)
    r += s.charAt(j)
  }
  return r
}

function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir, true)) {
    fs.mkdirSync(dir)
  }
}

function smsNotify(proj, content) {
  try {
    let url = `http://110.40.228.192:51001/smsNotify?proj=${proj}&content=${content}`
    needle('get', url).then()
  } catch(e) {
    log.error(`sms notify error,${JSON.stringify(e)}`)
  }
}


async function waitAll(futures, batchSize) {
  batch = []
  for (let i = 0; i < futures.length; i++) {
    batch.push(futures[i])
    if (batch.length >= batchSize) {
      await Promise.allSettled(batch)
      batch = []
    }
  }
  if (batch.length > 0) {
    await Promise.allSettled(batch)
  }
}

module.exports = {
  isAlpha,
  stringToHex,
  createDirIfNotExists,
  randString,
  smsNotify,
  waitAll,
}

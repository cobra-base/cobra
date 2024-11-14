const needle = require('needle')
const fs = require('fs')
const log = require('../util/log')
const time = require('../util/time')

function sms(proj, content) {
  try {
    log.info(`sms nofity,proj ${proj},content ${content}`)
    let url = `http://110.40.228.192:51001/smsNotify?proj=${proj}&content=${content}`
    needle('get', url).then()
  } catch(e) {
    log.error(`sms notify error,${JSON.stringify(e)}`)
  }
}

let books_ = {}
async function smsLimit(proj, content, interval) {
  let k = `proj_1_content`
  if (books_[k] == undefined || books_[k] + interval < time.now()) {
    sms(proj, content)
    books_[k] = time.Now()
  }
}

module.exports = {
  sms,
  smsLimit,
}

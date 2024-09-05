function stringToHex(str) {
  const val = [...str].map(c => c.charCodeAt(0).toString(16).padStart(2, 0)).join``
  return '0x' + val;
}

function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir, true)) {
    fs.mkdirSync(dir)
  }
}

async function waitAll(promiseName, paramsArr, batchSize) {
  futures = []
  for (let i = 0; i < paramsArr.length; i++) {
    futures.push(promiseName(...paramsArr[i]))
    if (futures.length >= batchSize) {
      await Promise.allSettled(futures)
      futures = []
    }
  }
  if (futures.length > 0) {
    await Promise.allSettled(futures)
  }
}

module.exports = {
  stringToHex,
  createDirIfNotExists,
  waitAll,
}
function stringToHex(str) {
  const val = [...str].map(c => c.charCodeAt(0).toString(16).padStart(2, 0)).join``
  return '0x' + val;
}

function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir, true)) {
    fs.mkdirSync(dir)
  }
}

async function waitAll(futures, batchSize) {
  batch = []
  for (let i = 0; i < futures.length; i++) {
    batch.push(futures[i]))
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
  stringToHex,
  createDirIfNotExists,
  waitAll,
}
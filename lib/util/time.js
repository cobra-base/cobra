function now() {
  var timestamp = new Date().getTime()
  return Math.floor(timestamp / 1000)
}

function nowS() {
  let d = new Date()
  return d.toISOString()
}

async function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis))  
}  
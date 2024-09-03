function randomizeBetween(min, max) {
  let diff = max - min
  return Math.round(min + diff * Math.random())  
}

module.exports = {
  randomizeBetween,
}
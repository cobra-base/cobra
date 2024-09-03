const assert = require('assert')
const cobra = require('../')

describe('cobra util test', function() {
  
  it('randomizeBetween', function(){
    let n = cobra.rand.randomizeBetween(0, 0)
    assert.equal(n, 0)

    n = cobra.rand.randomizeBetween(1, 1)
    assert.equal(n, 1)
    
    n = cobra.rand.randomizeBetween(10, 20)
    assert.ok(n >= 10 && n <= 20)

    n = cobra.rand.randomizeBetween(20, 15)
    assert.ok(n >= 15 && n <= 20)
  })

  it('time(call only)', function(){
    cobra.time.now()
    cobra.time.nowS()
    cobra.time.sleep(1)
  })

})

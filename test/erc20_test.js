const assert = require('assert')
const cobra = require('../')

describe('cobra erc20 test', function() {
  
  it('addr0', function(){
  	assert.ok(cobra.erc20.addr0.length == 42)
  })
  
})

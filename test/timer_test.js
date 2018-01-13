import assert from 'assert'
import Timer from '../lib/timer'

describe("Timer", function() {
  it("should fire an event once in due time", function(done) {
    let fired = 0
    let timer = new Timer(function() {
      ++fired
    })

    assert.equal(false, timer.running)
    timer.start(20)
    assert.equal(true, timer.running)

    setTimeout(function() {
      assert.equal(1, fired)
      done()
    }
    , 50)
  })

  it("shouldn't fire after it is stopped", function(done) {
    let fired = 0
    let timer = new Timer(function() {
      ++fired
    })

    timer.start(20)
    setTimeout((() => timer.stop()), 10)

    setTimeout(function() {
      assert.equal(0, fired)
      done()
    }
    , 50)
  })


  it("should restart interval on each start() call", function(done) {
    let okToFire = false
    let fired = 0
    let timer = new Timer(function() {
      assert.equal(true, okToFire)
      ++fired
    })

    timer.start(10)
    setTimeout((() => timer.start(50)), 5)
    setTimeout((() => okToFire = true), 15)

    setTimeout(function() {
      assert.equal(1, fired)
      done()
    }
    , 100)
  })
})


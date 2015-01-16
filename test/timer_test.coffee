{ Timer } = require 'timer'

assert = require 'assert'

exports['timer should fire an event once in due time'] = (done) ->
  timer = new Timer ->
    # if this does not fire in 2 seconds Mocha fails this test
    done()

  assert.equal no, timer.running
  timer.start(20)
  assert.equal yes, timer.running

exports['timer should not fire after it is stopped'] = (done) ->
  fired = false
  timer = new Timer ->
    fired = true

  timer.start(20)
  
  setTimeout(( -> 
    timer.stop()
  ), 10)

  setTimeout(( -> 
    timer.stop()
    assert.equal false, fired
    done()
  ), 30)


exports['timer should restart interval on each start() call'] = (done) ->
  checkin = [new Date().valueOf()]
  
  timer = new Timer ->
    checkin.push( new Date().valueOf() )

  timer.start(15)
  # this will reset timer to +20 at 10 ms, making 30 ms total
  setTimeout((-> timer.start(20)), 10)

  setTimeout((-> 
    # making sure we properly interrupted the first run
    assert.equal 1, checkin.length
  ), 20)

  setTimeout(( -> 
    assert.equal 2, checkin.length
    t = checkin[1] - checkin[0]
    assert.ok (t >= 30)
    done()
  ), 100)


{ Timer } = require 'timer'


exports['timer should fire an event once in due time'] = (beforeExit, assert) ->
  fired = 0
  timer = new Timer ->
    ++fired

  assert.equal no, timer.running
  timer.start(20)
  assert.equal yes, timer.running

  beforeExit ->
    assert.equal 1, fired


exports['timer should not fire after it is stopped'] = (beforeExit, assert) ->
  fired = 0
  timer = new Timer ->
    ++fired

  timer.start(20)
  setTimeout((-> timer.stop()), 10)

  beforeExit ->
    assert.equal 0, fired


exports['timer should restart interval on each start() call'] = (beforeExit, assert) ->
  okToFire = no
  fired = 0
  timer = new Timer ->
    assert.equal yes, okToFire
    ++fired

  timer.start(10)
  setTimeout((-> timer.start(100)), 5)
  setTimeout((-> okToFire = yes), 15)

  beforeExit ->
    assert.equal 1, fired

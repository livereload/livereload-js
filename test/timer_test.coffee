assert = require 'assert'
{ Timer } = require '../src/timer'

describe "Timer", ->
  it "should fire an event once in due time", (done) ->
    fired = 0
    timer = new Timer ->
      ++fired

    assert.equal no, timer.running
    timer.start(20)
    assert.equal yes, timer.running

    setTimeout ->
      assert.equal 1, fired
      done()
    , 50


  it "shouldn't fire after it is stopped", (done) ->
    fired = 0
    timer = new Timer ->
      ++fired

    timer.start(20)
    setTimeout((-> timer.stop()), 10)

    setTimeout ->
      assert.equal 0, fired
      done()
    , 50


  it "should restart interval on each start() call", (done) ->
    okToFire = no
    fired = 0
    timer = new Timer ->
      assert.equal yes, okToFire
      ++fired

    timer.start(10)
    setTimeout((-> timer.start(50)), 5)
    setTimeout((-> okToFire = yes), 15)

    setTimeout ->
      assert.equal 1, fired
      done()
    , 100

{ Options } = require 'options'
jsdom = require 'jsdom'
assert = require 'assert'

exports['should extract host and port from a SCRIPT tag'] = (done) ->

  jsdom.env """
    <script src="http://somewhere.com:9876/livereload.js"></script>
  """, [], (errors, window) ->
    assert.ok(not errors?)

    options = Options.extract(window.document)
    assert.ok(options?)
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port
    done()


exports['should recognize zlivereload.js as a valid SCRIPT tag for dev testing purposes'] = (done) ->

  jsdom.env """
    <script src="http://somewhere.com:9876/zlivereload.js"></script>
  """, [], (errors, window) ->
    assert.ok(not errors?)

    options = Options.extract(window.document)
    assert.ok(options?)
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port
    done()


exports['should pick the correct SCRIPT tag'] = (done) ->

  jsdom.env """
    <script src="http://elsewhere.com:1234/livesomething.js"></script>
    <script src="http://somewhere.com:9876/livereload.js"></script>
    <script src="http://elsewhere.com:1234/dontreload.js"></script>
  """, [], (errors, window) ->
    assert.ok(not errors?)

    options = Options.extract(window.document)
    assert.ok(options?)
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port
    done()


exports['should extract additional options'] = (done) ->

  jsdom.env """
    <script src="http://somewhere.com:9876/livereload.js?snipver=1&ext=Safari&extver=2.0"></script>
  """, [], (errors, window) ->
    assert.ok(not errors?)

    options = Options.extract(window.document)
    assert.equal '1', options.snipver
    assert.equal 'Safari', options.ext
    assert.equal '2.0', options.extver
    done()


exports['should be cool with a strange URL'] = (done) ->

  jsdom.env """
    <script src="safari-ext://132324324/23243443/4343/livereload.js?host=somewhere.com"></script>
  """, [], (errors, window) ->
    assert.ok(not errors?)

    options = Options.extract(window.document)
    assert.equal 'somewhere.com', options.host
    assert.equal 35729, options.port
    done()


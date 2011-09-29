{ Options } = require 'options'
jsdom = require 'jsdom'


exports['should extract host and port from a SCRIPT tag'] = (beforeExit, assert) ->
  _loaded = no
  jsdom.env """
    <script src="http://somewhere.com:9876/livereload.js"></script>
  """, [], (errors, window) ->
    assert.isNull errors
    _loaded = yes

    options = Options.extract(window.document)
    assert.isNotNull options
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port

  beforeExit -> assert.ok _loaded


exports['should pick the correct SCRIPT tag'] = (beforeExit, assert) ->
  _loaded = no
  jsdom.env """
    <script src="http://elsewhere.com:1234/livesomething.js"></script>
    <script src="http://somewhere.com:9876/livereload.js"></script>
    <script src="http://elsewhere.com:1234/dontreload.js"></script>
  """, [], (errors, window) ->
    assert.isNull errors
    _loaded = yes

    options = Options.extract(window.document)
    assert.isNotNull options
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port

  beforeExit -> assert.ok _loaded


exports['should extract additional options'] = (beforeExit, assert) ->
  _loaded = no
  jsdom.env """
    <script src="http://somewhere.com:9876/livereload.js?snipver=1&ext=Safari&extver=2.0"></script>
  """, [], (errors, window) ->
    assert.isNull errors
    _loaded = yes

    options = Options.extract(window.document)
    assert.equal '1', options.snipver
    assert.equal 'Safari', options.ext
    assert.equal '2.0', options.extver

  beforeExit -> assert.ok _loaded

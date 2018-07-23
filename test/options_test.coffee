assert = require 'assert'
{JSDOM} = require 'jsdom'

{ Options } = require '../src/options'


describe "Options", ->
  it "should extract host and port from a SCRIPT tag", ->
    dom = new JSDOM("""<script src="http://somewhere.com:9876/livereload.js"></script>""")

    options = Options.extract(dom.window.document)
    assert.ok options?
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port


  it "should recognize zlivereload.js as a valid SCRIPT tag for dev testing purposes", ->
    dom = new JSDOM("""<script src="http://somewhere.com:9876/zlivereload.js"></script>""")

    options = Options.extract(dom.window.document)
    assert.ok options?
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port


  it "should pick the correct SCRIPT tag", ->
    dom = new JSDOM("""<script src="http://elsewhere.com:1234/livesomething.js"></script> <script src="http://somewhere.com:9876/livereload.js"></script> <script src="http://elsewhere.com:1234/dontreload.js"></script>""")

    options = Options.extract(dom.window.document)
    assert.ok options?
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port


  it "should extract additional options", ->
    dom = new JSDOM("""<script src="http://somewhere.com:9876/livereload.js?snipver=1&ext=Safari&extver=2.0"></script>""")

    options = Options.extract(dom.window.document)
    assert.equal '1', options.snipver
    assert.equal 'Safari', options.ext
    assert.equal '2.0', options.extver


  it "should be cool with a strange URL", ->
    dom = new JSDOM("""<script src="safari-ext://132324324/23243443/4343/livereload.js?host=somewhere.com"></script>""")

    options = Options.extract(dom.window.document)
    assert.equal 'somewhere.com', options.host
    assert.equal 35729, options.port

  it "should accept when livereload is not being served domain root", ->
    dom = new JSDOM("""<script src="http://somewhere.com:9876/132324324/23243443/4343/livereload.js"></script>""")
    options = Options.extract(dom.window.document)
    assert.equal 'somewhere.com', options.host
    assert.equal 9876, options.port

  it "should set https when using an https URL ", ->
    dom = new JSDOM("""<script src="https://somewhere.com:9876/livereload.js"></script>""")

    options = Options.extract(dom.window.document)
    assert.ok options?
    assert.equal true, options.https

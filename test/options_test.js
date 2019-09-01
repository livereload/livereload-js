const assert = require('assert');
const { JSDOM } = require('jsdom');

const { Options } = require('../src/options');

describe('Options', function () {
  it('should extract host and port from a SCRIPT tag', function () {
    const dom = new JSDOM('<script src="http://somewhere.com:9876/livereload.js"></script>');

    const options = Options.extract(dom.window.document);
    assert.ok(options);
    assert.strictEqual('somewhere.com', options.host);
    return assert.strictEqual(9876, options.port);
  });

  it('should recognize zlivereload.js as a valid SCRIPT tag for dev testing purposes', function () {
    const dom = new JSDOM('<script src="http://somewhere.com:9876/zlivereload.js"></script>');

    const options = Options.extract(dom.window.document);
    assert.ok(options);
    assert.strictEqual('somewhere.com', options.host);
    return assert.strictEqual(9876, options.port);
  });

  it('should pick the correct SCRIPT tag', function () {
    const dom = new JSDOM('<script src="http://elsewhere.com:1234/livesomething.js"></script> <script src="http://somewhere.com:9876/livereload.js"></script> <script src="http://elsewhere.com:1234/dontreload.js"></script>');

    const options = Options.extract(dom.window.document);
    assert.ok(options);
    assert.strictEqual('somewhere.com', options.host);
    return assert.strictEqual(9876, options.port);
  });

  it('should extract additional options', function () {
    const dom = new JSDOM('<script src="http://somewhere.com:9876/livereload.js?snipver=1&ext=Safari&extver=2.0"></script>');

    const options = Options.extract(dom.window.document);
    assert.strictEqual(1, options.snipver);
    assert.strictEqual('Safari', options.ext);
    return assert.strictEqual(2, options.extver);
  });

  it('should be cool with a strange URL', function () {
    const dom = new JSDOM('<script src="safari-ext://132324324/23243443/4343/livereload.js?host=somewhere.com"></script>');

    const options = Options.extract(dom.window.document);
    assert.strictEqual('somewhere.com', options.host);
    return assert.strictEqual(35729, options.port);
  });

  it('should accept when livereload is not being served domain root', function () {
    const dom = new JSDOM('<script src="http://somewhere.com:9876/132324324/23243443/4343/livereload.js"></script>');
    const options = Options.extract(dom.window.document);
    assert.strictEqual('somewhere.com', options.host);
    return assert.strictEqual(9876, options.port);
  });

  it('should fallback to port 35729', function () {
    const dom = new JSDOM('<script src="http://somewhere.com/132324324/23243443/4343/livereload.js"></script>');
    const options = Options.extract(dom.window.document);
    assert.ok(options);
    return assert.strictEqual(35729, options.port);
  });

  it('should recognize port 80', function () {
    const dom = new JSDOM('<script src="http://somewhere.com:80/132324324/23243443/4343/livereload.js"></script>');
    const options = Options.extract(dom.window.document);
    assert.ok(options);
    return assert.strictEqual(80, options.port);
  });

  it('should set https when using an https URL', function () {
    const dom = new JSDOM('<script src="https://somewhere.com:9876/livereload.js"></script>');

    const options = Options.extract(dom.window.document);
    assert.ok(options);
    return assert.strictEqual(true, options.https);
  });

  return it('should recognize protocol-relative https URL', function () {
    const dom = new JSDOM('<script src="//somewhere.com/132324324/23243443/4343/livereload.js"></script>', {
      url: 'https://somewhere.org/'
    });
    const options = Options.extract(dom.window.document);
    assert.ok(options);
    return assert.strictEqual(true, options.https);
  });
});

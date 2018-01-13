/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import assert from 'assert'
import {JSDOM} from 'jsdom';
import {extractOptions} from '../lib/options'


describe("Options", function() {
  it("should extract host and port from a SCRIPT tag", function() {
    const dom = new JSDOM("<script src=\"http://somewhere.com:9876/livereload.js\"></script>");

    const options = extractOptions(dom.window.document);
    assert.ok(options != null);
    assert.equal('somewhere.com', options.host);
    return assert.equal(9876, options.port);
  });


  it("should recognize zlivereload.js as a valid SCRIPT tag for dev testing purposes", function() {
    const dom = new JSDOM("<script src=\"http://somewhere.com:9876/zlivereload.js\"></script>");

    const options = extractOptions(dom.window.document);
    assert.ok(options != null);
    assert.equal('somewhere.com', options.host);
    return assert.equal(9876, options.port);
  });


  it("should pick the correct SCRIPT tag", function() {
    const dom = new JSDOM("<script src=\"http://elsewhere.com:1234/livesomething.js\"></script> <script src=\"http://somewhere.com:9876/livereload.js\"></script> <script src=\"http://elsewhere.com:1234/dontreload.js\"></script>");

    const options = extractOptions(dom.window.document);
    assert.ok(options != null);
    assert.equal('somewhere.com', options.host);
    return assert.equal(9876, options.port);
  });


  it("should extract additional options", function() {
    const dom = new JSDOM("<script src=\"http://somewhere.com:9876/livereload.js?snipver=1&ext=Safari&extver=2.0\"></script>");

    const options = extractOptions(dom.window.document);
    assert.equal('1', options.snipver);
    assert.equal('Safari', options.ext);
    return assert.equal('2.0', options.extver);
  });


  it("should be cool with a strange URL", function() {
    const dom = new JSDOM("<script src=\"safari-ext://132324324/23243443/4343/livereload.js?host=somewhere.com\"></script>");

    const options = extractOptions(dom.window.document);
    assert.equal('somewhere.com', options.host);
    return assert.equal(35729, options.port);
  });


  return it("should set https when using an https URL ", function() {
    const dom = new JSDOM("<script src=\"https://somewhere.com:9876/livereload.js\"></script>");

    const options = extractOptions(dom.window.document);
    assert.ok(options != null);
    return assert.equal(true, options.https);
  });
});


/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const assert = require('assert');
const { Parser } = require('../src/protocol');

class MockHandler {
  constructor() {
    this._log = [];
    this.gotError = false;
  }

  obtainLog() { const result = this._log.join("\n"); this._log = []; return result; }
  log(message) { return this._log.push(message); }

  connected(protocol)  {
    this.protocol = protocol;
  }
  error(error)     { this.error = error; return this.gotError = true; }

  message(msg) {
    switch (msg.command) {
      case 'reload':     return this.log(`reload(${msg.path})`);
      default:                   return this.log(msg.commmand);
    }
  }
}

describe("Protocol", function() {
  it("should reject a bogus handshake", function() {
    const handler = new MockHandler();
    const parser  = new Parser(handler);

    parser.process('boo');
    return assert.ok(handler.gotError);
  });


  it("should speak protocol 6", function() {
    const handler = new MockHandler();
    const parser  = new Parser(handler);

    parser.process('!!ver:1.6');
    assert.equal(6, parser.protocol);

    parser.process('[ "refresh", { "path": "foo.css" } ]');
    return assert.equal("reload(foo.css)", handler.obtainLog());
  });


  return it("should speak protocol 7", function() {
    const handler = new MockHandler();
    const parser  = new Parser(handler);

    parser.process('{ "command": "hello", "protocols": [ "http://livereload.com/protocols/official-7" ] }');
    assert.equal(null, handler.error != null ? handler.error.message : undefined);
    assert.equal(7, parser.protocol);

    parser.process('{ "command": "reload", "path": "foo.css" }');
    return assert.equal("reload(foo.css)", handler.obtainLog());
  });
});

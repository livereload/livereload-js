/* eslint no-new: "off" */
const assert = require('assert');
const { Options } = require('../src/options');
const { Connector } = require('../src/connector');
const { PROTOCOL_7 } = require('../src/protocol');

const HELLO = { command: 'hello', protocols: [PROTOCOL_7] };

class MockHandlers {
  constructor () {
    this._log = [];
  }

  obtainLog () { const result = this._log.join('\n'); this._log = []; return result; }

  log (message) { return this._log.push(message); }

  connecting () { return this.log('connecting'); }

  socketConnected () {}

  connected (protocol) { return this.log(`connected(${protocol})`); }

  disconnected (reason) { return this.log(`disconnected(${reason})`); }

  message (message) { return this.log(`message(${message.command})`); }
}

const newMockTimer = function () {
  class MockTimer {
    constructor (func) {
      this.func = func;
      MockTimer.timers.push(this);
      this.time = null;
    }

    start (timeout) {
      this.time = MockTimer.now + timeout;
    }

    stop () {
      this.time = null;
    }

    fire () {
      this.time = null;
      return this.func();
    }
  }

  MockTimer.timers = [];
  MockTimer.now = 0;
  MockTimer.advance = function (period) {
    MockTimer.now += period;
    return (() => {
      const result = [];
      for (const timer of MockTimer.timers) {
        if (timer.time && timer.time <= MockTimer.now) {
          result.push(timer.fire());
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  };

  return MockTimer;
};

const newMockWebSocket = function () {
  class MockWebSocket {
    constructor () {
      MockWebSocket._last = this;
      this.sent = [];
      this.readyState = MockWebSocket.CONNECTING;
    }

    obtainSent () { const result = this.sent; this.sent = []; return result; }

    log (message) { return this._log.push(message); }

    send (message) { return this.sent.push(message); }

    close () {
      this.readyState = MockWebSocket.CLOSED;
      return this.onclose({});
    }

    connected () {
      this.readyState = MockWebSocket.OPEN;
      return this.onopen({});
    }

    disconnected () {
      this.readyState = MockWebSocket.CLOSED;
      return this.onclose({});
    }

    receive (message) {
      return this.onmessage({ data: message });
    }

    assertMessages (messages) {
      let message;
      let key;
      const actual = [];
      const expected = [];

      const keys = [];
      for (message of messages) {
        for (key of Object.keys(message)) {
          if (!keys.includes(key)) {
            keys.push(key);
          }
        }
      }
      keys.sort();

      for (const payload of this.sent) {
        message = JSON.parse(payload);
        actual.push(((() => {
          const result = [];
          for (key of keys) {
            if (Object.prototype.hasOwnProperty.call(message, key)) {
              result.push(`${key} = ${JSON.stringify(message[key])}`);
            }
          }
          return result;
        })()));
      }
      for (message of messages) {
        expected.push(((() => {
          const result1 = [];
          for (key of keys) {
            if (Object.prototype.hasOwnProperty.call(message, key)) {
              result1.push(`${key} = ${JSON.stringify(message[key])}`);
            }
          }
          return result1;
        })()));
      }

      assert.strictEqual(expected.join('\n'), actual.join('\n'));
      this.sent = [];
    }
  }

  MockWebSocket.last = function () { const result = MockWebSocket._last; MockWebSocket._last = null; return result; };

  MockWebSocket.CONNECTING = 0;
  MockWebSocket.OPEN = 1;
  MockWebSocket.CLOSED = 2;

  return MockWebSocket;
};

const shouldBeConnecting = handlers => assert.strictEqual('connecting', handlers.obtainLog());

const shouldReconnect = function (handlers, timer, failed, code) {
  let delays;
  if (failed) {
    delays = [1000, 2000, 4000, 8000, 16000, 32000, 60000, 60000, 60000];
  } else {
    delays = [1000, 1000, 1000];
  }
  return (() => {
    const result = [];
    for (const delay of delays) {
      timer.advance(delay - 100);
      assert.strictEqual('', handlers.obtainLog());

      timer.advance(100);
      shouldBeConnecting(handlers);

      result.push(code());
    }
    return result;
  })();
};

const cannotConnect = function (handlers, webSocket) {
  let ws;
  assert.ok((ws = webSocket.last()) != null);
  ws.disconnected();
  return assert.strictEqual('disconnected(cannot-connect)', handlers.obtainLog());
};

const connectionBroken = function (handlers, ws) {
  ws.disconnected();
  return assert.strictEqual('disconnected(broken)', handlers.obtainLog());
};

const connectAndPerformHandshake = function (handlers, webSocket, func) {
  let ws;
  assert.ok((ws = webSocket.last()) != null);

  ws.connected();
  ws.assertMessages([{ command: 'hello' }]);
  assert.strictEqual('', handlers.obtainLog());

  ws.receive(JSON.stringify(HELLO));
  assert.strictEqual('connected(7)', handlers.obtainLog());

  return (typeof func === 'function' ? func(ws) : undefined);
};

const connectAndTimeoutHandshake = function (handlers, timer, webSocket, func) {
  let ws;
  assert.ok((ws = webSocket.last()) != null);

  ws.connected();
  ws.assertMessages([{ command: 'hello' }]);
  assert.strictEqual('', handlers.obtainLog());

  timer.advance(5000);
  return assert.strictEqual('disconnected(handshake-timeout)', handlers.obtainLog());
};

const sendReload = function (handlers, ws) {
  ws.receive(JSON.stringify({ command: 'reload', path: 'foo.css' }));
  return assert.strictEqual('message(reload)', handlers.obtainLog());
};

describe('Connector', function () {
  it('should connect and perform handshake', function () {
    const handlers = new MockHandlers();
    const options = new Options();
    const timer = newMockTimer();
    const webSocket = newMockWebSocket();
    new Connector(options, webSocket, timer, handlers);

    shouldBeConnecting(handlers);
    return connectAndPerformHandshake(handlers, webSocket, ws => sendReload(handlers, ws));
  });

  it('should repeat connection attempts', function () {
    const handlers = new MockHandlers();
    const options = new Options();
    const timer = newMockTimer();
    const webSocket = newMockWebSocket();
    new Connector(options, webSocket, timer, handlers);

    shouldBeConnecting(handlers);
    cannotConnect(handlers, webSocket);

    return shouldReconnect(handlers, timer, true, () => cannotConnect(handlers, webSocket));
  });

  it('should reconnect after disconnection', function () {
    const handlers = new MockHandlers();
    const options = new Options();
    const timer = newMockTimer();
    const webSocket = newMockWebSocket();
    new Connector(options, webSocket, timer, handlers);

    shouldBeConnecting(handlers);
    connectAndPerformHandshake(handlers, webSocket, ws => connectionBroken(handlers, ws));

    return shouldReconnect(handlers, timer, false, () =>
      connectAndPerformHandshake(handlers, webSocket, ws => connectionBroken(handlers, ws))
    );
  });

  it('should timeout handshake after 5 sec', function () {
    const handlers = new MockHandlers();
    const options = new Options();
    const timer = newMockTimer();
    const webSocket = newMockWebSocket();
    new Connector(options, webSocket, timer, handlers);

    shouldBeConnecting(handlers);
    connectAndTimeoutHandshake(handlers, timer, webSocket);

    return shouldReconnect(handlers, timer, true, () => connectAndTimeoutHandshake(handlers, timer, webSocket));
  });

  return it('should use wss protocol with https option', function () {
    const handlers = new MockHandlers();
    const timer = newMockTimer();
    const webSocket = newMockWebSocket();
    const options = new Options();
    options.https = true;
    options.host = 'localhost';
    const connector = new Connector(options, webSocket, timer, handlers);

    return assert.strictEqual('wss://localhost:35729/livereload', connector._uri);
  });
});

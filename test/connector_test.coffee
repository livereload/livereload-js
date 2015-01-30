assert = require 'assert'
{ Options }    = require '../src/options'
{ Connector }  = require '../src/connector'
{ PROTOCOL_7 } = require '../src/protocol'

HELLO = { command: 'hello', protocols: [PROTOCOL_7] }

class MockHandlers
  constructor: ->
    @_log = []

  obtainLog: -> result = @_log.join("\n"); @_log = []; result
  log: (message) -> @_log.push message

  connecting:                 -> @log "connecting"
  socketConnected:            ->
  connected:       (protocol) -> @log "connected(#{protocol})"
  disconnected:    (reason)   -> @log "disconnected(#{reason})"
  message:         (message)  -> @log "message(#{message.command})"

newMockTimer = ->
  class MockTimer
    constructor: (@func) ->
      MockTimer.timers.push this
      @time = null

    start: (timeout) ->
      @time = MockTimer.now + timeout

    stop: ->
      @time = null

    fire: ->
      @time = null
      @func()

  MockTimer.timers = []
  MockTimer.now = 0
  MockTimer.advance = (period) ->
    MockTimer.now += period
    for timer in MockTimer.timers
      timer.fire() if timer.time? and timer.time <= MockTimer.now

  return MockTimer

newMockWebSocket = ->
  class MockWebSocket
    constructor: ->
      MockWebSocket._last = this
      @sent = []
      @readyState = MockWebSocket.CONNECTING

    obtainSent: -> result = @sent; @sent = []; result
    log: (message) -> @_log.push message

    send: (message) -> @sent.push message

    close: ->
      @readyState = MockWebSocket.CLOSED
      @onclose({})

    connected: ->
      @readyState = MockWebSocket.OPEN
      @onopen({})

    disconnected: ->
      @readyState = MockWebSocket.CLOSED
      @onclose({})

    receive: (message) ->
      @onmessage({ data: message })

    assertMessages: (messages) ->
      actual   = []
      expected = []

      keys = []
      for message in messages
        for own key, value of message
          keys.push key unless key in keys
      keys.sort()

      for payload in @sent
        message = JSON.parse(payload)
        actual.push ("#{key} = #{JSON.stringify(message[key])}" for key in keys when message.hasOwnProperty(key))
      for message in messages
        expected.push ("#{key} = #{JSON.stringify(message[key])}" for key in keys when message.hasOwnProperty(key))

      assert.equal expected.join("\n"), actual.join("\n")
      @sent = []

  MockWebSocket.last = -> result = MockWebSocket._last; MockWebSocket._last = null; result

  MockWebSocket.CONNECTING = 0
  MockWebSocket.OPEN = 1
  MockWebSocket.CLOSED = 2

  return MockWebSocket


shouldBeConnecting = (handlers) ->
  assert.equal "connecting", handlers.obtainLog()

shouldReconnect = (handlers, timer, failed, code) ->
  if failed
    delays = [1000, 2000, 4000, 8000, 16000, 32000, 60000, 60000, 60000]
  else
    delays = [1000, 1000, 1000]
  for delay in delays
    timer.advance delay-100
    assert.equal "", handlers.obtainLog()

    timer.advance 100
    shouldBeConnecting handlers

    code()

cannotConnect = (handlers, webSocket) ->
  assert.ok (ws = webSocket.last())?
  ws.disconnected()
  assert.equal "disconnected(cannot-connect)", handlers.obtainLog()

connectionBroken = (handlers, ws) ->
  ws.disconnected()
  assert.equal "disconnected(broken)", handlers.obtainLog()

connectAndPerformHandshake = (handlers, webSocket, func) ->
  assert.ok (ws = webSocket.last())?

  ws.connected()
  ws.assertMessages [{ command: 'hello' }]
  assert.equal "", handlers.obtainLog()

  ws.receive JSON.stringify(HELLO)
  assert.equal "connected(7)", handlers.obtainLog()

  func?(ws)

connectAndTimeoutHandshake = (handlers, timer, webSocket, func) ->
  assert.ok (ws = webSocket.last())?

  ws.connected()
  ws.assertMessages [{ command: 'hello' }]
  assert.equal "", handlers.obtainLog()

  timer.advance 5000
  assert.equal "disconnected(handshake-timeout)", handlers.obtainLog()

sendReload = (handlers, ws) ->
  ws.receive JSON.stringify({ command: 'reload', path: 'foo.css' })
  assert.equal "message(reload)", handlers.obtainLog()


describe "Connector", ->
  it "should connect and perform handshake", ->
    handlers  = new MockHandlers()
    options   = new Options()
    timer     = newMockTimer()
    webSocket = newMockWebSocket()
    connector = new Connector(options, webSocket, timer, handlers)

    shouldBeConnecting handlers
    connectAndPerformHandshake handlers, webSocket, (ws) ->
      sendReload handlers, ws


  it "should repeat connection attempts", ->
    handlers  = new MockHandlers()
    options   = new Options()
    timer     = newMockTimer()
    webSocket = newMockWebSocket()
    connector = new Connector(options, webSocket, timer, handlers)

    shouldBeConnecting handlers
    cannotConnect handlers, webSocket

    shouldReconnect handlers, timer, yes, ->
      cannotConnect handlers, webSocket


  it "should reconnect after disconnection", ->
    handlers  = new MockHandlers()
    options   = new Options()
    timer     = newMockTimer()
    webSocket = newMockWebSocket()
    connector = new Connector(options, webSocket, timer, handlers)

    shouldBeConnecting handlers
    connectAndPerformHandshake handlers, webSocket, (ws) ->
      connectionBroken handlers, ws

    shouldReconnect handlers, timer, no, ->
      connectAndPerformHandshake handlers, webSocket, (ws) ->
        connectionBroken handlers, ws


  it "should timeout handshake after 5 sec", ->
    handlers  = new MockHandlers()
    options   = new Options()
    timer     = newMockTimer()
    webSocket = newMockWebSocket()
    connector = new Connector(options, webSocket, timer, handlers)

    shouldBeConnecting handlers
    connectAndTimeoutHandshake handlers, timer, webSocket

    shouldReconnect handlers, timer, yes, ->
      connectAndTimeoutHandshake handlers, timer, webSocket

  it "should use wss protocol with https option", ->
    handlers  = new MockHandlers()
    timer     = newMockTimer()
    webSocket = newMockWebSocket()
    options   = new Options()
    options.https = true
    options.host = "localhost"
    connector = new Connector(options, webSocket, timer, handlers)

    assert.equal "wss://localhost:35729/livereload", connector._uri

{ Parser, PROTOCOL_6, PROTOCOL_7 } = require './protocol'

Version = '2.2.2'

exports.Connector = class Connector

  constructor: (@options, @WebSocket, @Timer, @handlers) ->
    @_uri = "ws#{if @options.https then "s" else ""}://#{@options.host}:#{@options.port}/livereload"

    @_nextDelay = @options.mindelay
    @_connectionDesired = no
    @protocol = 0

    @protocolParser = new Parser
      connected: (@protocol) =>
        @_handshakeTimeout.stop()
        @_nextDelay = @options.mindelay
        @_disconnectionReason = 'broken'
        @handlers.connected(protocol)
      error: (e) =>
        @handlers.error(e)
        @_closeOnError()
      message: (message) =>
        @handlers.message(message)

    @_handshakeTimeout = new Timer =>
      return unless @_isSocketConnected()
      @_disconnectionReason = 'handshake-timeout'
      @socket.close()

    @_reconnectTimer = new Timer =>
      return unless @_connectionDesired  # shouldn't hit this, but just in case
      @connect()

    @connect()


  _isSocketConnected: ->
    @socket and @socket.readyState is @WebSocket.OPEN

  connect: ->
    @_connectionDesired = yes
    return if @_isSocketConnected()

    # prepare for a new connection
    @_reconnectTimer.stop()
    @_disconnectionReason = 'cannot-connect'
    @protocolParser.reset()

    @handlers.connecting()

    @socket = new @WebSocket(@_uri)
    @socket.onopen    = (e) => @_onopen(e)
    @socket.onclose   = (e) => @_onclose(e)
    @socket.onmessage = (e) => @_onmessage(e)
    @socket.onerror   = (e) => @_onerror(e)

  disconnect: ->
    @_connectionDesired = no
    @_reconnectTimer.stop()   # in case it was running
    return unless @_isSocketConnected()
    @_disconnectionReason = 'manual'
    @socket.close()


  _scheduleReconnection: ->
    return unless @_connectionDesired  # don't reconnect after manual disconnection
    unless @_reconnectTimer.running
      @_reconnectTimer.start(@_nextDelay)
      @_nextDelay = Math.min(@options.maxdelay, @_nextDelay * 2)

  sendCommand: (command) ->
    return unless @protocol?
    @_sendCommand command

  _sendCommand: (command) ->
    @socket.send JSON.stringify(command)

  _closeOnError: ->
    @_handshakeTimeout.stop()
    @_disconnectionReason = 'error'
    @socket.close()

  _onopen: (e) ->
    @handlers.socketConnected()
    @_disconnectionReason = 'handshake-failed'

    # start handshake
    hello = { command: 'hello', protocols: [PROTOCOL_6, PROTOCOL_7] }
    hello.ver     = Version
    hello.ext     = @options.ext     if @options.ext
    hello.extver  = @options.extver  if @options.extver
    hello.snipver = @options.snipver if @options.snipver
    @_sendCommand hello
    @_handshakeTimeout.start(@options.handshake_timeout)

  _onclose: (e) ->
    @protocol = 0
    @handlers.disconnected @_disconnectionReason, @_nextDelay
    @_scheduleReconnection()

  _onerror: (e) ->

  _onmessage: (e) ->
    @protocolParser.process(e.data)

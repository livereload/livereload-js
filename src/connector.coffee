{ Parser, PROTOCOL_6, PROTOCOL_7 } = require 'protocol'

exports.Connector = class Connector

  constructor: (@options, @WebSocket, @Timer, @handlers) ->
    @_uri = "ws://#{@options.host}:#{@options.port}/livereload"
    @_nextDelay = @options.mindelay

    @protocolParser = new Parser
      connected: (protocol) =>
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

    @_reconnectTimer = new Timer => @connect()

    @connect()


  _isSocketConnected: ->
    @socket and @socket.readyState is @WebSocket.OPEN

  connect: ->
    return if @_isSocketConnected()

    # prepare for a new connection
    clearTimeout @_reconnectTimer if @_reconnectTimer
    @_disconnectionReason = 'cannot-connect'
    @protocolParser.reset()

    @handlers.connecting()

    @socket = new @WebSocket(@_uri)
    @socket.onopen    = (e) => @_onopen(e)
    @socket.onclose   = (e) => @_onclose(e)
    @socket.onmessage = (e) => @_onmessage(e)
    @socket.onerror   = (e) => @_onerror(e)

  _scheduleReconnection: ->
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
    @_sendCommand { command: 'hello', protocols: [PROTOCOL_6, PROTOCOL_7] }
    @_handshakeTimeout.start(@options.handshake_timeout)

  _onclose: (e) ->
    @handlers.disconnected @_disconnectionReason, @_nextDelay
    @_scheduleReconnection() unless @_disconnectionReason is 'manual'

  _onerror: (e) ->

  _onmessage: (e) ->
    @protocolParser.process(e.data)

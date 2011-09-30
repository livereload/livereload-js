{ Connector } = require 'connector'
{ Timer } = require 'timer'
{ Options } = require 'options'

exports.LiveReload = class LiveReload

  constructor: (@window) ->
    # i can haz console?
    @console = if @window.console && @window.console.log && @window.console.error
      @window.console
    else
      log:   ->
      error: ->

    # i can haz sockets?
    unless @WebSocket = @window.WebSocket || @window.MozWebSocket
      console.error("LiveReload disabled because the browser does not seem to support web sockets")
      return

    # i can haz options?
    unless @options = Options.extract(@window.document)
      console.error("LiveReload disabled because it could not find its own <SCRIPT> tag")
      return

    # i can haz connection?
    @connector = new Connector @options, @WebSocket, Timer,
      connecting: =>

      socketConnected: =>

      connected: (protocol) =>
        @log "LiveReload is connected to #{@options.host}:#{@options.port} (protocol v#{protocol})."

      error: (e) =>
        if e instanceof ProtocolError
          console.log "#{e.message}."
        else
          console.log "LiveReload internal error: #{e.message}"

      disconnected: (reason, nextDelay) =>
        switch reason
          when 'cannot-connect'
            @log "LiveReload cannot connect to #{@options.host}:#{@options.port}, will retry in #{nextDelay} sec."
          when 'broken'
            @log "LiveReload disconnected from #{@options.host}:#{@options.port}, reconnecting in #{nextDelay} sec."
          when 'handshake-timeout'
            @log "LiveReload cannot connect to #{@options.host}:#{@options.port} (handshake timeout), will retry in #{nextDelay} sec."
          when 'handshake-failed'
            @log "LiveReload cannot connect to #{@options.host}:#{@options.port} (handshake failed), will retry in #{nextDelay} sec."
          when 'manual' then #nop
          when 'error'  then #nop
          else
            @log "LiveReload disconnected from #{@options.host}:#{@options.port} (#{reason}), reconnecting in #{nextDelay} sec."

      message: (message) =>
        @log "LiveReload received message #{message.command}."

  log: (message) ->
    @console.log "#{message}"

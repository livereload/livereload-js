export const PROTOCOL_6 = 'http://livereload.com/protocols/official-6'
export const PROTOCOL_7 = 'http://livereload.com/protocols/official-7'

export class ProtocolError {
  constructor(reason, data) {
    this.message = `LiveReload protocol error (${reason}) after receiving data: \"${data}\".`
  }
}

export class Parser {
  constructor(handlers) {
    this.handlers = handlers
    this.reset()
  }

  reset() {
    this.protocol = null
  }

  process(data) {
    try {
      let message
      if ((this.protocol == null)) {
        if (data.match(/^!!ver:([\d.]+)$/)) {
          this.protocol = 6
        } else if (message = this._parseMessage(data, {'hello': true})) {
          if (!message.protocols.length) {
            throw new ProtocolError("no protocols specified in handshake message", data)
          } else if (message.protocols.indexOf(PROTOCOL_7) !== -1) {
            this.protocol = 7
          } else if (message.protocols.indexOf(PROTOCOL_6) !== -1) {
            this.protocol = 6
          } else {
            throw new ProtocolError("no supported protocols found", data)
          }
        }
        return this.handlers.connected(this.protocol)
      } else if (this.protocol === 6) {
        message = JSON.parse(data)
        if (!message.length) {
          throw new ProtocolError("protocol 6 messages must be arrays", data)
        }
        const [command, options] = Array.from(message)
        if (command !== 'refresh') {
          throw new ProtocolError("unknown protocol 6 command", data)
        }

        this.handlers.message({command: 'reload', path: options.path, liveCSS: options.apply_css_live != null ? options.apply_css_live : true})
      } else {
        message = this._parseMessage(data, {'reload': true, 'alert': true})
        this.handlers.message(message)
      }
    } catch (e) {
      if (e instanceof ProtocolError) {
        this.handlers.error(e)
      } else {
        throw e
      }
    }
  }

  _parseMessage(data, validCommands) {
    let message
    try {
      message = JSON.parse(data)
    } catch (e) {
      throw new ProtocolError('unparsable JSON', data)
    }
    if (!message.command) {
      throw new ProtocolError('missing "command" key', data)
    }
    if (!validCommands.hasOwnProperty(message.command)) {
      throw new ProtocolError(`invalid command '${message.command}'`, data)
    }
    return message
  }
}


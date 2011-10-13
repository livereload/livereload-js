exports.Timer = class Timer
  constructor: (@func) ->
    @running = no; @id = null
    @_handler = =>
      @running = no; @id = null
      @func()

  start: (timeout) ->
    clearTimeout @id if @running
    @id = setTimeout @_handler, timeout
    @running = yes

  stop: ->
    if @running
      clearTimeout @id
      @running = no; @id = null

Timer.start = (timeout, func) ->
  setTimeout func, timeout

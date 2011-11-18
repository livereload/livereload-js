
module.exports = class LessPlugin
  @identifier = 'less'
  @version = '1.0'

  constructor: (@window, @host) ->

  reload: (path, options) ->
    if path.match(/\.less$/i) and @window.less and @window.less.refresh
      @window.less.refresh(true)
      return

  analyze: ->
    { disable: !!(@window.less and @window.less.refresh) }


module.exports = class LessPlugin
  @identifier = 'less'
  @version = '1.0'

  constructor: (@window, @host) ->

  reload: (path, options) ->
    console.log [path, options]
    if (path.match(/\.less$/i) || options.originalPath.match(/\.less$/i)) and @window.less and @window.less.refresh
      @host.console.log "LiveReload is asking LESS to recompile all stylesheets"
      @window.less.refresh(true)
      return true
    false

  analyze: ->
    { disable: !!(@window.less and @window.less.refresh) }

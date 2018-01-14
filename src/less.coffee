
module.exports = class LessPlugin
  @identifier = 'less'
  @version = '1.0'

  constructor: (@window, @host) ->

  reload: (path, options) ->
    if @window.less and @window.less.refresh
      if path.match(/\.less$/i)
        return @reloadLess(path)
      if options.originalPath.match(/\.less$/i)
        return @reloadLess(options.originalPath)
    no

  reloadLess: (path) ->
    links = (link for link in document.getElementsByTagName('link') when link.href and link.rel.match(/^stylesheet\/less$/i) or (link.rel.match(/stylesheet/i) and link.type.match(/^text\/(x-)?less$/i)))

    return no if links.length is 0

    for link in links
      link.href = @host.generateCacheBustUrl(link.href)

    @host.console.log "LiveReload is asking LESS to recompile all stylesheets"
    @window.less.refresh(true)
    return yes


  analyze: ->
    { disable: !!(@window.less and @window.less.refresh) }

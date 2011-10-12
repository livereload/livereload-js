splitUrl = (url) ->
  if (index = url.indexOf('#')) >= 0
    hash = url.slice(index)
    url = url.slice(0, index)
  else
    hash = ''

  if (index = url.indexOf('?')) >= 0
    params = url.slice(index)
    url = url.slice(0, index)
  else
    params = ''

  return { url, params, hash }

pathFromUrl = (url) ->
  url = splitUrl(url).url
  if url.indexOf('file://') == 0
    path = url.replace ///^ file:// (localhost)? ///, ''
  else
    #                        http  :   // hostname  :8080  /
    path = url.replace ///^ ([^:]+ :)? // ([^:/]+) (:\d*)? / ///, '/'

  # decodeURI has special handling of stuff like semicolons, so use decodeURIComponent
  return decodeURIComponent(path)

pickBestMatch = (path, objects, pathFunc) ->
  bestMatch = { score: 0 }
  for object in objects
    score = numberOfMatchingSegments(path, pathFunc(object))
    if score > bestMatch.score
      bestMatch = { object, score }

  if bestMatch.score > 0 then bestMatch else null

numberOfMatchingSegments = (path1, path2) ->
  # get rid of leading slashes and normalize to lower case
  path1 = path1.replace(/^\/+/, '').toLowerCase()
  path2 = path2.replace(/^\/+/, '').toLowerCase()

  return 10000 if path1 is path2

  comps1 = path1.split('/').reverse()
  comps2 = path2.split('/').reverse()
  len = Math.min(comps1.length, comps2.length)

  eqCount = 0
  while eqCount < len && comps1[eqCount] == comps2[eqCount]
    ++eqCount

  console.log "numberOfMatchingSegments('#{path1}', '#{path2}') == #{eqCount}"
  return eqCount

exports.Reloader = class Reloader

  constructor: (@window, @console, @Timer) ->
    @document = @window.document
    @stylesheetGracePeriod = 200


  reload: (path, liveCSS) ->
    if liveCSS
      if path.match(/\.css$/i)
        return if @reloadStylesheet(path)
    @reloadPage()


  reloadPage: ->
    @window.document.location.reload()


  reloadStylesheet: (path) ->
    # has to be a real array, because DOMNodeList will be modified
    links = (link for link in @document.getElementsByTagName('link') when link.rel is 'stylesheet')
    console.log "Found #{links.length} stylesheets"
    match = pickBestMatch(path, links, (l) -> pathFromUrl(l.href))
    if match
      @console.log "LiveReload is reloading stylesheet: #{match.object.href}"
      @reattachStylesheetLink(match.object)
    else
      @console.log "LiveReload will reload all stylesheets because path '#{path}' did not match any specific one"
      for link in links
        @reattachStylesheetLink(link)
    return true


  reattachStylesheetLink: (link) ->
    # ignore LINKs that will be removed by LR soon
    return if link.__LiveReload_pendingRemoval
    link.__LiveReload_pendingRemoval = yes

    clone = link.cloneNode(false)
    clone.href = @generateCacheBustUrl(link.href)

    # insert the new LINK before the old one
    parent = link.parentNode
    if parent.lastChild is link
        parent.appendChild(clone)
    else
        parent.insertBefore clone, link.nextSibling

    # give the browser some time to parse the new stylesheet, then remove the old one
    timer = new @Timer ->
      link.parentNode.removeChild(link) if link.parentNode
    timer.start(@stylesheetGracePeriod)


  generateUniqueString: ->
    'livereload=' + Date.now()


  generateCacheBustUrl: (url) ->
    expando = @generateUniqueString()
    { url, hash, params: oldParams } = splitUrl(url)

    params = oldParams.replace /(\?|&)livereload=(\d+)/, (match, sep) -> "#{sep}#{expando}"
    if params == oldParams
      if oldParams.length == 0
        params = "?#{expando}"
      else
        params = "#{oldParams}&#{expando}"

    return url + params + hash

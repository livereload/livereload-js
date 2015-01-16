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

  return eqCount

pathsMatch = (path1, path2) -> numberOfMatchingSegments(path1, path2) > 0


IMAGE_STYLES = [
  { selector: 'background', styleNames: ['backgroundImage'] }
  { selector: 'border', styleNames: ['borderImage', 'webkitBorderImage', 'MozBorderImage'] }
]


exports.Reloader = class Reloader

  constructor: (@window, @console, @Timer) ->
    @document = @window.document
    @importCacheWaitPeriod = 200
    @plugins = []


  addPlugin: (plugin) ->
    @plugins.push plugin


  analyze: (callback) ->
    results


  reload: (path, options) ->
    @options = options  # avoid passing it through all the funcs
    @options.stylesheetReloadTimeout ?= 15000
    for plugin in @plugins
      if plugin.reload && plugin.reload(path, options)
        return
    if options.liveCSS
      if path.match(/\.css$/i)
        return if @reloadStylesheet(path)
    if options.liveImg
      if path.match(/\.(jpe?g|png|gif)$/i)
        @reloadImages(path)
        return
    @reloadPage()


  reloadPage: ->
    @window.document.location.reload()


  reloadImages: (path) ->
    expando = @generateUniqueString()

    for img in this.document.images
      if pathsMatch(path, pathFromUrl(img.src))
        img.src = @generateCacheBustUrl(img.src, expando)

    if @document.querySelectorAll
      for { selector, styleNames } in IMAGE_STYLES
        for img in @document.querySelectorAll("[style*=#{selector}]")
          @reloadStyleImages img.style, styleNames, path, expando

    if @document.styleSheets
      for styleSheet in @document.styleSheets
        @reloadStylesheetImages styleSheet, path, expando


  reloadStylesheetImages: (styleSheet, path, expando) ->
    try
      rules = styleSheet?.cssRules
    catch e
      #
    return unless rules

    for rule in rules
      switch rule.type
        when CSSRule.IMPORT_RULE
          @reloadStylesheetImages rule.styleSheet, path, expando
        when CSSRule.STYLE_RULE
          for { styleNames } in IMAGE_STYLES
            @reloadStyleImages rule.style, styleNames, path, expando
        when CSSRule.MEDIA_RULE
          @reloadStylesheetImages rule, path, expando

    return


  reloadStyleImages: (style, styleNames, path, expando) ->
    for styleName in styleNames
      value = style[styleName]
      if typeof value is 'string'
        newValue = value.replace ///\b url \s* \( ([^)]*) \) ///, (match, src) =>
          if pathsMatch(path, pathFromUrl(src))
            "url(#{@generateCacheBustUrl(src, expando)})"
          else
            match
        if newValue != value
          style[styleName] = newValue
    return


  reloadStylesheet: (path) ->
    # has to be a real array, because DOMNodeList will be modified
    links = (link for link in @document.getElementsByTagName('link') when link.rel.match(/^stylesheet$/i) and not link.__LiveReload_pendingRemoval)

    # find all imported stylesheets
    imported = []
    for style in @document.getElementsByTagName('style') when style.sheet
      @collectImportedStylesheets style, style.sheet, imported
    for link in links
      @collectImportedStylesheets link, link.sheet, imported

    # handle prefixfree
    if @window.StyleFix && @document.querySelectorAll
      for style in @document.querySelectorAll('style[data-href]')
        links.push style

    @console.log "LiveReload found #{links.length} LINKed stylesheets, #{imported.length} @imported stylesheets"
    match = pickBestMatch(path, links.concat(imported), (l) => pathFromUrl(@linkHref(l)))

    if match
      if match.object.rule
        @console.log "LiveReload is reloading imported stylesheet: #{match.object.href}"
        @reattachImportedRule(match.object)
      else
        @console.log "LiveReload is reloading stylesheet: #{@linkHref(match.object)}"
        @reattachStylesheetLink(match.object)
    else
      @console.log "LiveReload will reload all stylesheets because path '#{path}' did not match any specific one"
      for link in links
        @reattachStylesheetLink(link)
    return true


  collectImportedStylesheets: (link, styleSheet, result) ->
    # in WebKit, styleSheet.cssRules is null for inaccessible stylesheets;
    # Firefox/Opera may throw exceptions
    try
      rules = styleSheet?.cssRules
    catch e
      #
    if rules && rules.length
      for rule, index in rules
        switch rule.type
          when CSSRule.CHARSET_RULE
            continue # do nothing
          when CSSRule.IMPORT_RULE
            result.push { link, rule, index, href: rule.href }
            @collectImportedStylesheets link, rule.styleSheet, result
          else
            break  # import rules can only be preceded by charset rules
    return


  waitUntilCssLoads: (clone, func) ->
    callbackExecuted = no

    executeCallback = =>
      return if callbackExecuted
      callbackExecuted = yes
      func()

    # supported by Chrome 19+, Safari 5.2+, Firefox 9+, Opera 9+, IE6+
    # http://www.zachleat.com/web/load-css-dynamically/
    # http://pieisgood.org/test/script-link-events/
    clone.onload = =>
      @console.log "LiveReload: the new stylesheet has finished loading"
      @knownToSupportCssOnLoad = yes
      executeCallback()

    unless @knownToSupportCssOnLoad
      # polling
      do poll = =>
        if clone.sheet
          @console.log "LiveReload is polling until the new CSS finishes loading..."
          executeCallback()
        else
          @Timer.start 50, poll

    # fail safe
    @Timer.start @options.stylesheetReloadTimeout, executeCallback


  linkHref: (link) ->
    # prefixfree uses data-href when it turns LINK into STYLE
    link.href || link.getAttribute('data-href')


  reattachStylesheetLink: (link) ->
    # ignore LINKs that will be removed by LR soon
    return if link.__LiveReload_pendingRemoval
    link.__LiveReload_pendingRemoval = yes

    if link.tagName is 'STYLE'
      # prefixfree
      clone = @document.createElement('link')
      clone.rel      = 'stylesheet'
      clone.media    = link.media
      clone.disabled = link.disabled
    else
      clone = link.cloneNode(false)

    clone.href = @generateCacheBustUrl(@linkHref(link))

    # insert the new LINK before the old one
    parent = link.parentNode
    if parent.lastChild is link
        parent.appendChild(clone)
    else
        parent.insertBefore clone, link.nextSibling

    @waitUntilCssLoads clone, =>
      if /AppleWebKit/.test(navigator.userAgent)
        additionalWaitingTime = 5
      else
        additionalWaitingTime = 200

      @Timer.start additionalWaitingTime, =>
        return if !link.parentNode
        link.parentNode.removeChild(link)
        clone.onreadystatechange = null

        @window.StyleFix?.link(clone) # prefixfree


  reattachImportedRule: ({ rule, index, link }) ->
    parent  = rule.parentStyleSheet
    href    = @generateCacheBustUrl(rule.href)
    media   = if rule.media.length then [].join.call(rule.media, ', ') else ''
    newRule = """@import url("#{href}") #{media};"""

    # used to detect if reattachImportedRule has been called again on the same rule
    rule.__LiveReload_newHref = href

    # WORKAROUND FOR WEBKIT BUG: WebKit resets all styles if we add @import'ed
    # stylesheet that hasn't been cached yet. Workaround is to pre-cache the
    # stylesheet by temporarily adding it as a LINK tag.
    tempLink = @document.createElement("link")
    tempLink.rel = 'stylesheet'
    tempLink.href = href
    tempLink.__LiveReload_pendingRemoval = yes  # exclude from path matching
    if link.parentNode
      link.parentNode.insertBefore tempLink, link

    # wait for it to load
    @Timer.start @importCacheWaitPeriod, =>
      tempLink.parentNode.removeChild(tempLink) if tempLink.parentNode

      # if another reattachImportedRule call is in progress, abandon this one
      return if rule.__LiveReload_newHref isnt href

      parent.insertRule newRule, index
      parent.deleteRule index+1

      # save the new rule, so that we can detect another reattachImportedRule call
      rule = parent.cssRules[index]
      rule.__LiveReload_newHref = href

      # repeat again for good measure
      @Timer.start @importCacheWaitPeriod, =>
        # if another reattachImportedRule call is in progress, abandon this one
        return if rule.__LiveReload_newHref isnt href

        parent.insertRule newRule, index
        parent.deleteRule index+1


  generateUniqueString: ->
    'livereload=' + Date.now()


  generateCacheBustUrl: (url, expando=@generateUniqueString()) ->
    { url, hash, params: oldParams } = splitUrl(url)

    if @options.overrideURL
      if url.indexOf(@options.serverURL) < 0
        originalUrl = url
        url = @options.serverURL + @options.overrideURL + "?url=" + encodeURIComponent(url)
        @console.log "LiveReload is overriding source URL #{originalUrl} with #{url}"

    params = oldParams.replace /(\?|&)livereload=(\d+)/, (match, sep) -> "#{sep}#{expando}"
    if params == oldParams
      if oldParams.length == 0
        params = "?#{expando}"
      else
        params = "#{oldParams}&#{expando}"

    return url + params + hash

exports.Options = class Options
  constructor: ->
    @https   = false
    @host    = null
    @port    = 35729

    @snipver = null
    @ext     = null
    @extver  = null

    @mindelay = 1000
    @maxdelay = 60000
    @handshake_timeout = 5000

  set: (name, value) ->
    if typeof value is 'undefined'
      return

    if not isNaN(+value)
      value = +value

    @[name] = value

Options.extract = (document) ->
  for element in document.getElementsByTagName('script')
    if (src = element.src) && (m = src.match ///^ [^:]+ :// (.*) / z?livereload\.js (?: \? (.*) )? $///)
      options = new Options()
      options.https = src.indexOf("https") is 0
      if mm = m[1].match ///^ ([^/:]+) (?: : (\d+) )? $///
        options.host = mm[1]
        if mm[2]
          options.port = parseInt(mm[2], 10)

      if m[2]
        for pair in m[2].split('&')
          if (keyAndValue = pair.split('=')).length > 1
            options.set keyAndValue[0].replace(/-/g, '_'), keyAndValue.slice(1).join('=')
      return options

  return null

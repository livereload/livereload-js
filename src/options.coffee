
exports.Options = class Options
  constructor: ->
    @host    = null
    @port    = null

    @snipver = null
    @ext     = null
    @extver  = null

    @mindelay = 1000
    @maxdelay = 60000
    @handshake_timeout = 5000

  set: (name, value) ->
    switch typeof @[name]
      when 'undefined' then # ignore
      when 'number'
        @[name] = +value
      else
        @[name] = value

Options.extract = (document) ->
  for element in document.getElementsByTagName('script')
    if (src = element.src) && (m = src.match ///^ https?:// ([^/:]+) : (\d+) / livereload\.js (?: \? (.*) )? $///)
      options = new Options()
      options.host = m[1]
      options.port = parseInt(m[2], 10)

      if m[3]
        for pair in m[3].split('&')
          if (keyAndValue = pair.split('=')).length > 1
            options.set keyAndValue[0].replace(/-/g, '_'), keyAndValue.slice(1).join('=')
      return options

  return null

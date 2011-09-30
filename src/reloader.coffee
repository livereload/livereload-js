exports.Reloader = class Reloader

  constructor: (@window) ->

  reload: (path) ->
    @window.document.location.reload()

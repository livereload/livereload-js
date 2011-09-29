fs   = require 'fs'
path = require 'path'

task 'stitch', 'Build a merged JS file', ->
  stitch = require 'stitch'
  package = stitch.createPackage(paths: [__dirname + "/lib"])

  package.compile (err, source) ->
    fs.writeFile __dirname + "/dist/livereload.js", source, (err) ->
      throw err if err
      console.log "Compiled livereload.js"

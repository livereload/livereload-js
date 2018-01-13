/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as customevents from './customevents'
import livereload from './livereload'

var LiveReload = new livereload(window)
export default LiveReload

for (let k in window) {
  if (k.match(/^LiveReloadPlugin/)) {
    LiveReload.addPlugin(window[k])
  }
}

LiveReload.addPlugin(require('./less'))

LiveReload.on('shutdown', () => delete window.LiveReload)
LiveReload.on('connect', () => customevents.fire(document, 'LiveReloadConnect'))
LiveReload.on('disconnect', () => customevents.fire(document, 'LiveReloadDisconnect'))

customevents.bind(document, 'LiveReloadShutDown', () => LiveReload.shutDown())

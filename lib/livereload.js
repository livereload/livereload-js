/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Connector from './connector'
import Timer from './timer'
import Options from './options'
import {extractOptions} from './options'
import Reloader from './reloader'
import { ProtocolError } from './protocol'

export default class LiveReload {

  constructor(window) {
    this.window = window;
    this.listeners = {};
    this.plugins = [];
    this.pluginIdentifiers = {};

    // i can haz console?
    this.console =
      this.window.console && this.window.console.log && this.window.console.error ?
        this.window.location.href.match(/LR-verbose/) ?
          this.window.console
        :{
          log() {},
          error: this.window.console.error.bind(this.window.console)
        }
      :{
        log() {},
        error() {}
      };

    // i can haz sockets?
    if (!(this.WebSocket = this.window.WebSocket || this.window.MozWebSocket)) {
      this.console.error("LiveReload disabled because the browser does not seem to support web sockets");
      return;
    }

    // i can haz options?
    if ('LiveReloadOptions' in window) {
      this.options = new Options();
      for (let k of Object.keys(window['LiveReloadOptions'] || {})) {
        const v = window['LiveReloadOptions'][k];
        this.options.set(k, v);
      }
    } else {
      this.options = extractOptions(this.window.document);
      if (!this.options) {
        this.console.error("LiveReload disabled because it could not find its own <SCRIPT> tag");
        return;
      }
    }

    // i can haz reloader?
    this.reloader = new Reloader(this.window, this.console, Timer);

    // i can haz connection?
    this.connector = new Connector(this.options, this.WebSocket, Timer, {
      connecting: () => {},

      socketConnected: () => {},

      connected: protocol => {
        if (typeof this.listeners.connect === 'function') {
          this.listeners.connect();
        }
        this.log(`LiveReload is connected to ${this.options.host}:${this.options.port} (protocol v${protocol}).`);
        return this.analyze();
      },

      error: e => {
        if (e instanceof ProtocolError) {
          if (typeof console !== 'undefined' && console !== null) { return console.log(`${e.message}.`); }
        } else {
          if (typeof console !== 'undefined' && console !== null) { return console.log(`LiveReload internal error: ${e.message}`); }
        }
      },

      disconnected: (reason, nextDelay) => {
        if (typeof this.listeners.disconnect === 'function') {
          this.listeners.disconnect();
        }
        switch (reason) {
          case 'cannot-connect':
            return this.log(`LiveReload cannot connect to ${this.options.host}:${this.options.port}, will retry in ${nextDelay} sec.`);
          case 'broken':
            return this.log(`LiveReload disconnected from ${this.options.host}:${this.options.port}, reconnecting in ${nextDelay} sec.`);
          case 'handshake-timeout':
            return this.log(`LiveReload cannot connect to ${this.options.host}:${this.options.port} (handshake timeout), will retry in ${nextDelay} sec.`);
          case 'handshake-failed':
            return this.log(`LiveReload cannot connect to ${this.options.host}:${this.options.port} (handshake failed), will retry in ${nextDelay} sec.`);
          case 'manual': //nop
          case 'error': //nop
          default:
            return this.log(`LiveReload disconnected from ${this.options.host}:${this.options.port} (${reason}), reconnecting in ${nextDelay} sec.`);
        }
      },

      message: message => {
        switch (message.command) {
          case 'reload': return this.performReload(message);
          case 'alert':  return this.performAlert(message);
        }
      }
    }
    );

    this.initialized = true;
  }

  on(eventName, handler) {
    return this.listeners[eventName] = handler;
  }

  log(message) {
    return this.console.log(`${message}`);
  }

  performReload(message) {
    this.log(`LiveReload received reload request: ${JSON.stringify(message, null, 2)}`);
    return this.reloader.reload(message.path, {
      liveCSS: message.liveCSS != null ? message.liveCSS : true,
      liveImg: message.liveImg != null ? message.liveImg : true,
      originalPath: message.originalPath || '',
      overrideURL: message.overrideURL || '',
      serverURL: `http://${this.options.host}:${this.options.port}`
    }
    );
  }

  performAlert(message) {
    return alert(message.message);
  }

  shutDown() {
    if (!this.initialized) { return; }
    this.connector.disconnect();
    this.log("LiveReload disconnected.");
    return (typeof this.listeners.shutdown === 'function' ? this.listeners.shutdown() : undefined);
  }

  hasPlugin(identifier) { return !!this.pluginIdentifiers[identifier]; }

  addPlugin(pluginClass) {
    if (!this.initialized) { return; }

    if (this.hasPlugin(pluginClass.identifier)) { return; }
    this.pluginIdentifiers[pluginClass.identifier] = true;

    const plugin = new pluginClass(this.window, {

      // expose internal objects for those who know what they're doing
      // (note that these are private APIs and subject to change at any time!)
      _livereload: this,
      _reloader:   this.reloader,
      _connector:  this.connector,

      // official API
      console: this.console,
      Timer,
      generateCacheBustUrl: url => this.reloader.generateCacheBustUrl(url)
    }
    );

    // API that pluginClass can/must provide:
    //
    // string pluginClass.identifier
    //   -- required, globally-unique name of this plugin
    //
    // string pluginClass.version
    //   -- required, plugin version number (format %d.%d or %d.%d.%d)
    //
    // plugin = new pluginClass(window, officialLiveReloadAPI)
    //   -- required, plugin constructor
    //
    // bool plugin.reload(string path, { bool liveCSS, bool liveImg })
    //   -- optional, attemp to reload the given path, return true if handled
    //
    // object plugin.analyze()
    //   -- optional, returns plugin-specific information about the current document (to send to the connected server)
    //      (LiveReload 2 server currently only defines 'disable' key in this object; return {disable:true} to disable server-side
    //       compilation of a matching plugin's files)

    this.plugins.push(plugin);
    this.reloader.addPlugin(plugin);
  }

  analyze() {
    if (!this.initialized) { return; }
    if (!(this.connector.protocol >= 7)) { return; }

    const pluginsData = {};
    for (let plugin of Array.from(this.plugins)) {
      var pluginData;
      pluginsData[plugin.constructor.identifier] = (pluginData = (typeof plugin.analyze === 'function' ? plugin.analyze() : undefined) || {});
      pluginData.version = plugin.constructor.version;
    }

    this.connector.sendCommand({ command: 'info', plugins: pluginsData, url: this.window.location.href });
  }

}

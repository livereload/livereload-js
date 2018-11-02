(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function() {
  var Connector, PROTOCOL_6, PROTOCOL_7, Parser, Version;

  ({Parser, PROTOCOL_6, PROTOCOL_7} = require('./protocol'));

  Version = '2.2.2';

  exports.Connector = Connector = class Connector {
    constructor(options, WebSocket, Timer, handlers) {
      var path;
      this.options = options;
      this.WebSocket = WebSocket;
      this.Timer = Timer;
      this.handlers = handlers;
      path = this.options.path ? `${this.options.path}` : "livereload";
      this._uri = `ws${(this.options.https ? "s" : "")}://${this.options.host}:${this.options.port}/${path}`;
      this._nextDelay = this.options.mindelay;
      this._connectionDesired = false;
      this.protocol = 0;
      this.protocolParser = new Parser({
        connected: (protocol) => {
          this.protocol = protocol;
          this._handshakeTimeout.stop();
          this._nextDelay = this.options.mindelay;
          this._disconnectionReason = 'broken';
          return this.handlers.connected(this.protocol);
        },
        error: (e) => {
          this.handlers.error(e);
          return this._closeOnError();
        },
        message: (message) => {
          return this.handlers.message(message);
        }
      });
      this._handshakeTimeout = new this.Timer(() => {
        if (!this._isSocketConnected()) {
          return;
        }
        this._disconnectionReason = 'handshake-timeout';
        return this.socket.close();
      });
      this._reconnectTimer = new this.Timer(() => {
        if (!this._connectionDesired) { // shouldn't hit this, but just in case
          return;
        }
        return this.connect();
      });
      this.connect();
    }

    _isSocketConnected() {
      return this.socket && this.socket.readyState === this.WebSocket.OPEN;
    }

    connect() {
      this._connectionDesired = true;
      if (this._isSocketConnected()) {
        return;
      }
      // prepare for a new connection
      this._reconnectTimer.stop();
      this._disconnectionReason = 'cannot-connect';
      this.protocolParser.reset();
      this.handlers.connecting();
      this.socket = new this.WebSocket(this._uri);
      this.socket.onopen = (e) => {
        return this._onopen(e);
      };
      this.socket.onclose = (e) => {
        return this._onclose(e);
      };
      this.socket.onmessage = (e) => {
        return this._onmessage(e);
      };
      return this.socket.onerror = (e) => {
        return this._onerror(e);
      };
    }

    disconnect() {
      this._connectionDesired = false;
      this._reconnectTimer.stop(); // in case it was running
      if (!this._isSocketConnected()) {
        return;
      }
      this._disconnectionReason = 'manual';
      return this.socket.close();
    }

    _scheduleReconnection() {
      if (!this._connectionDesired) { // don't reconnect after manual disconnection
        return;
      }
      if (!this._reconnectTimer.running) {
        this._reconnectTimer.start(this._nextDelay);
        return this._nextDelay = Math.min(this.options.maxdelay, this._nextDelay * 2);
      }
    }

    sendCommand(command) {
      if (this.protocol == null) {
        return;
      }
      return this._sendCommand(command);
    }

    _sendCommand(command) {
      return this.socket.send(JSON.stringify(command));
    }

    _closeOnError() {
      this._handshakeTimeout.stop();
      this._disconnectionReason = 'error';
      return this.socket.close();
    }

    _onopen(e) {
      var hello;
      this.handlers.socketConnected();
      this._disconnectionReason = 'handshake-failed';
      // start handshake
      hello = {
        command: 'hello',
        protocols: [PROTOCOL_6, PROTOCOL_7]
      };
      hello.ver = Version;
      if (this.options.ext) {
        hello.ext = this.options.ext;
      }
      if (this.options.extver) {
        hello.extver = this.options.extver;
      }
      if (this.options.snipver) {
        hello.snipver = this.options.snipver;
      }
      this._sendCommand(hello);
      return this._handshakeTimeout.start(this.options.handshake_timeout);
    }

    _onclose(e) {
      this.protocol = 0;
      this.handlers.disconnected(this._disconnectionReason, this._nextDelay);
      return this._scheduleReconnection();
    }

    _onerror(e) {}

    _onmessage(e) {
      return this.protocolParser.process(e.data);
    }

  };

}).call(this);

},{"./protocol":6}],2:[function(require,module,exports){
(function() {
  var CustomEvents;

  CustomEvents = {
    bind: function(element, eventName, handler) {
      if (element.addEventListener) {
        return element.addEventListener(eventName, handler, false);
      } else if (element.attachEvent) {
        element[eventName] = 1;
        return element.attachEvent('onpropertychange', function(event) {
          if (event.propertyName === eventName) {
            return handler();
          }
        });
      } else {
        throw new Error(`Attempt to attach custom event ${eventName} to something which isn't a DOMElement`);
      }
    },
    fire: function(element, eventName) {
      var event;
      if (element.addEventListener) {
        event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, true);
        return document.dispatchEvent(event);
      } else if (element.attachEvent) {
        if (element[eventName]) {
          return element[eventName]++;
        }
      } else {
        throw new Error(`Attempt to fire custom event ${eventName} on something which isn't a DOMElement`);
      }
    }
  };

  exports.bind = CustomEvents.bind;

  exports.fire = CustomEvents.fire;

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
  var LessPlugin;

  module.exports = LessPlugin = (function() {
    class LessPlugin {
      constructor(window, host) {
        this.window = window;
        this.host = host;
      }

      reload(path, options) {
        if (this.window.less && this.window.less.refresh) {
          if (path.match(/\.less$/i)) {
            return this.reloadLess(path);
          }
          if (options.originalPath.match(/\.less$/i)) {
            return this.reloadLess(options.originalPath);
          }
        }
        return false;
      }

      reloadLess(path) {
        var i, len, link, links;
        links = (function() {
          var i, len, ref, results;
          ref = document.getElementsByTagName('link');
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            link = ref[i];
            if (link.href && link.rel.match(/^stylesheet\/less$/i) || (link.rel.match(/stylesheet/i) && link.type.match(/^text\/(x-)?less$/i))) {
              results.push(link);
            }
          }
          return results;
        })();
        if (links.length === 0) {
          return false;
        }
        for (i = 0, len = links.length; i < len; i++) {
          link = links[i];
          link.href = this.host.generateCacheBustUrl(link.href);
        }
        this.host.console.log("LiveReload is asking LESS to recompile all stylesheets");
        this.window.less.refresh(true);
        return true;
      }

      analyze() {
        return {
          disable: !!(this.window.less && this.window.less.refresh)
        };
      }

    };

    LessPlugin.identifier = 'less';

    LessPlugin.version = '1.0';

    return LessPlugin;

  }).call(this);

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var Connector, LiveReload, Options, ProtocolError, Reloader, Timer,
    hasProp = {}.hasOwnProperty;

  ({Connector} = require('./connector'));

  ({Timer} = require('./timer'));

  ({Options} = require('./options'));

  ({Reloader} = require('./reloader'));

  ({ProtocolError} = require('./protocol'));

  exports.LiveReload = LiveReload = class LiveReload {
    constructor(window1) {
      var k, ref, v;
      this.window = window1;
      this.listeners = {};
      this.plugins = [];
      this.pluginIdentifiers = {};
      // i can haz console?
      this.console = this.window.console && this.window.console.log && this.window.console.error ? this.window.location.href.match(/LR-verbose/) ? this.window.console : {
        log: function() {},
        error: this.window.console.error.bind(this.window.console)
      } : {
        log: function() {},
        error: function() {}
      };
      // i can haz sockets?
      if (!(this.WebSocket = this.window.WebSocket || this.window.MozWebSocket)) {
        this.console.error("LiveReload disabled because the browser does not seem to support web sockets");
        return;
      }
      // i can haz options?
      if ('LiveReloadOptions' in window) {
        this.options = new Options();
        ref = window['LiveReloadOptions'];
        for (k in ref) {
          if (!hasProp.call(ref, k)) continue;
          v = ref[k];
          this.options.set(k, v);
        }
      } else {
        this.options = Options.extract(this.window.document);
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
        connected: (protocol) => {
          var base;
          if (typeof (base = this.listeners).connect === "function") {
            base.connect();
          }
          this.log(`LiveReload is connected to ${this.options.host}:${this.options.port} (protocol v${protocol}).`);
          return this.analyze();
        },
        error: (e) => {
          if (e instanceof ProtocolError) {
            if (typeof console !== "undefined" && console !== null) {
              return console.log(`${e.message}.`);
            }
          } else {
            if (typeof console !== "undefined" && console !== null) {
              return console.log(`LiveReload internal error: ${e.message}`);
            }
          }
        },
        disconnected: (reason, nextDelay) => {
          var base;
          if (typeof (base = this.listeners).disconnect === "function") {
            base.disconnect();
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
            case 'manual':
              break;
            case 'error':
              break;
            default:
              return this.log(`LiveReload disconnected from ${this.options.host}:${this.options.port} (${reason}), reconnecting in ${nextDelay} sec.`);
          }
        },
        message: (message) => {
          switch (message.command) {
            case 'reload':
              return this.performReload(message);
            case 'alert':
              return this.performAlert(message);
          }
        }
      });
      this.initialized = true;
    }

    on(eventName, handler) {
      return this.listeners[eventName] = handler;
    }

    log(message) {
      return this.console.log(`${message}`);
    }

    performReload(message) {
      var ref, ref1, ref2;
      this.log(`LiveReload received reload request: ${JSON.stringify(message, null, 2)}`);
      return this.reloader.reload(message.path, {
        liveCSS: (ref = message.liveCSS) != null ? ref : true,
        liveImg: (ref1 = message.liveImg) != null ? ref1 : true,
        reloadMissingCSS: (ref2 = message.reloadMissingCSS) != null ? ref2 : true,
        originalPath: message.originalPath || '',
        overrideURL: message.overrideURL || '',
        serverURL: `http://${this.options.host}:${this.options.port}`
      });
    }

    performAlert(message) {
      return alert(message.message);
    }

    shutDown() {
      var base;
      if (!this.initialized) {
        return;
      }
      this.connector.disconnect();
      this.log("LiveReload disconnected.");
      return typeof (base = this.listeners).shutdown === "function" ? base.shutdown() : void 0;
    }

    hasPlugin(identifier) {
      return !!this.pluginIdentifiers[identifier];
    }

    addPlugin(pluginClass) {
      var plugin;
      if (!this.initialized) {
        return;
      }
      if (this.hasPlugin(pluginClass.identifier)) {
        return;
      }
      this.pluginIdentifiers[pluginClass.identifier] = true;
      plugin = new pluginClass(this.window, {
        // expose internal objects for those who know what they're doing
        // (note that these are private APIs and subject to change at any time!)
        _livereload: this,
        _reloader: this.reloader,
        _connector: this.connector,
        // official API
        console: this.console,
        Timer: Timer,
        generateCacheBustUrl: (url) => {
          return this.reloader.generateCacheBustUrl(url);
        }
      });
      // API that pluginClass can/must provide:

      // string pluginClass.identifier
      //   -- required, globally-unique name of this plugin

      // string pluginClass.version
      //   -- required, plugin version number (format %d.%d or %d.%d.%d)

      // plugin = new pluginClass(window, officialLiveReloadAPI)
      //   -- required, plugin constructor

      // bool plugin.reload(string path, { bool liveCSS, bool liveImg })
      //   -- optional, attemp to reload the given path, return true if handled

      // object plugin.analyze()
      //   -- optional, returns plugin-specific information about the current document (to send to the connected server)
      //      (LiveReload 2 server currently only defines 'disable' key in this object; return {disable:true} to disable server-side
      //       compilation of a matching plugin's files)
      this.plugins.push(plugin);
      this.reloader.addPlugin(plugin);
    }

    analyze() {
      var i, len, plugin, pluginData, pluginsData, ref;
      if (!this.initialized) {
        return;
      }
      if (!(this.connector.protocol >= 7)) {
        return;
      }
      pluginsData = {};
      ref = this.plugins;
      for (i = 0, len = ref.length; i < len; i++) {
        plugin = ref[i];
        pluginsData[plugin.constructor.identifier] = pluginData = (typeof plugin.analyze === "function" ? plugin.analyze() : void 0) || {};
        pluginData.version = plugin.constructor.version;
      }
      this.connector.sendCommand({
        command: 'info',
        plugins: pluginsData,
        url: this.window.location.href
      });
    }

  };

}).call(this);

},{"./connector":1,"./options":5,"./protocol":6,"./reloader":7,"./timer":9}],5:[function(require,module,exports){
(function() {
  var Options;

  exports.Options = Options = class Options {
    constructor() {
      this.https = false;
      this.host = null;
      this.port = 35729;
      this.snipver = null;
      this.ext = null;
      this.extver = null;
      this.mindelay = 1000;
      this.maxdelay = 60000;
      this.handshake_timeout = 5000;
    }

    set(name, value) {
      if (typeof value === 'undefined') {
        return;
      }
      if (!isNaN(+value)) {
        value = +value;
      }
      return this[name] = value;
    }

  };

  Options.extract = function(document) {
    var element, i, j, keyAndValue, len, len1, m, mm, options, pair, ref, ref1, src;
    ref = document.getElementsByTagName('script');
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      if ((src = element.src) && (m = src.match(/^[^:]+:\/\/(.*)\/z?livereload\.js(?:\?(.*))?$/))) {
        options = new Options();
        options.https = src.indexOf("https") === 0;
        if (mm = m[1].match(/^([^\/:]+)(?::(\d+))?(\/+.*)?$/)) {
          options.host = mm[1];
          if (mm[2]) {
            options.port = parseInt(mm[2], 10);
          }
        }
        if (m[2]) {
          ref1 = m[2].split('&');
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            pair = ref1[j];
            if ((keyAndValue = pair.split('=')).length > 1) {
              options.set(keyAndValue[0].replace(/-/g, '_'), keyAndValue.slice(1).join('='));
            }
          }
        }
        return options;
      }
    }
    return null;
  };

}).call(this);

},{}],6:[function(require,module,exports){
(function() {
  var PROTOCOL_6, PROTOCOL_7, Parser, ProtocolError,
    indexOf = [].indexOf;

  exports.PROTOCOL_6 = PROTOCOL_6 = 'http://livereload.com/protocols/official-6';

  exports.PROTOCOL_7 = PROTOCOL_7 = 'http://livereload.com/protocols/official-7';

  exports.ProtocolError = ProtocolError = class ProtocolError {
    constructor(reason, data) {
      this.message = `LiveReload protocol error (${reason}) after receiving data: "${data}".`;
    }

  };

  exports.Parser = Parser = class Parser {
    constructor(handlers) {
      this.handlers = handlers;
      this.reset();
    }

    reset() {
      return this.protocol = null;
    }

    process(data) {
      var command, e, message, options, ref;
      try {
        if (this.protocol == null) {
          if (data.match(/^!!ver:([\d.]+)$/)) {
            this.protocol = 6;
          } else if (message = this._parseMessage(data, ['hello'])) {
            if (!message.protocols.length) {
              throw new ProtocolError("no protocols specified in handshake message");
            } else if (indexOf.call(message.protocols, PROTOCOL_7) >= 0) {
              this.protocol = 7;
            } else if (indexOf.call(message.protocols, PROTOCOL_6) >= 0) {
              this.protocol = 6;
            } else {
              throw new ProtocolError("no supported protocols found");
            }
          }
          return this.handlers.connected(this.protocol);
        } else if (this.protocol === 6) {
          message = JSON.parse(data);
          if (!message.length) {
            throw new ProtocolError("protocol 6 messages must be arrays");
          }
          [command, options] = message;
          if (command !== 'refresh') {
            throw new ProtocolError("unknown protocol 6 command");
          }
          return this.handlers.message({
            command: 'reload',
            path: options.path,
            liveCSS: (ref = options.apply_css_live) != null ? ref : true
          });
        } else {
          message = this._parseMessage(data, ['reload', 'alert']);
          return this.handlers.message(message);
        }
      } catch (error) {
        e = error;
        if (e instanceof ProtocolError) {
          return this.handlers.error(e);
        } else {
          throw e;
        }
      }
    }

    _parseMessage(data, validCommands) {
      var e, message, ref;
      try {
        message = JSON.parse(data);
      } catch (error) {
        e = error;
        throw new ProtocolError('unparsable JSON', data);
      }
      if (!message.command) {
        throw new ProtocolError('missing "command" key', data);
      }
      if (ref = message.command, indexOf.call(validCommands, ref) < 0) {
        throw new ProtocolError(`invalid command '${message.command}', only valid commands are: ${validCommands.join(', ')})`, data);
      }
      return message;
    }

  };

}).call(this);

},{}],7:[function(require,module,exports){
(function() {
  var IMAGE_STYLES, Reloader, numberOfMatchingSegments, pathFromUrl, pathsMatch, pickBestMatch, splitUrl;

  splitUrl = function(url) {
    var comboSign, hash, index, params;
    if ((index = url.indexOf('#')) >= 0) {
      hash = url.slice(index);
      url = url.slice(0, index);
    } else {
      hash = '';
    }
    // http://your.domain.com/path/to/combo/??file1.css,file2,css
    comboSign = url.indexOf('??');
    if (comboSign >= 0) {
      if (comboSign + 1 !== url.lastIndexOf('?')) {
        index = url.lastIndexOf('?');
      }
    } else {
      index = url.indexOf('?');
    }
    if (index >= 0) {
      params = url.slice(index);
      url = url.slice(0, index);
    } else {
      params = '';
    }
    return {url, params, hash};
  };

  pathFromUrl = function(url) {
    var path;
    url = splitUrl(url).url;
    if (url.indexOf('file://') === 0) {
      path = url.replace(/^file:\/\/(localhost)?/, '');
    } else {
      //                        http  :   // hostname  :8080  /
      path = url.replace(/^([^:]+:)?\/\/([^:\/]+)(:\d*)?\//, '/');
    }
    // decodeURI has special handling of stuff like semicolons, so use decodeURIComponent
    return decodeURIComponent(path);
  };

  pickBestMatch = function(path, objects, pathFunc) {
    var bestMatch, i, len1, object, score;
    bestMatch = {
      score: 0
    };
    for (i = 0, len1 = objects.length; i < len1; i++) {
      object = objects[i];
      score = numberOfMatchingSegments(path, pathFunc(object));
      if (score > bestMatch.score) {
        bestMatch = {object, score};
      }
    }
    if (bestMatch.score > 0) {
      return bestMatch;
    } else {
      return null;
    }
  };

  numberOfMatchingSegments = function(path1, path2) {
    var comps1, comps2, eqCount, len;
    // get rid of leading slashes and normalize to lower case
    path1 = path1.replace(/^\/+/, '').toLowerCase();
    path2 = path2.replace(/^\/+/, '').toLowerCase();
    if (path1 === path2) {
      return 10000;
    }
    comps1 = path1.split('/').reverse();
    comps2 = path2.split('/').reverse();
    len = Math.min(comps1.length, comps2.length);
    eqCount = 0;
    while (eqCount < len && comps1[eqCount] === comps2[eqCount]) {
      ++eqCount;
    }
    return eqCount;
  };

  pathsMatch = function(path1, path2) {
    return numberOfMatchingSegments(path1, path2) > 0;
  };

  IMAGE_STYLES = [
    {
      selector: 'background',
      styleNames: ['backgroundImage']
    },
    {
      selector: 'border',
      styleNames: ['borderImage',
    'webkitBorderImage',
    'MozBorderImage']
    }
  ];

  exports.Reloader = Reloader = class Reloader {
    constructor(window, console, Timer) {
      this.window = window;
      this.console = console;
      this.Timer = Timer;
      this.document = this.window.document;
      this.importCacheWaitPeriod = 200;
      this.plugins = [];
    }

    addPlugin(plugin) {
      return this.plugins.push(plugin);
    }

    analyze(callback) {
      return results;
    }

    reload(path, options) {
      var base, i, len1, plugin, ref;
      this.options = options; // avoid passing it through all the funcs
      if ((base = this.options).stylesheetReloadTimeout == null) {
        base.stylesheetReloadTimeout = 15000;
      }
      ref = this.plugins;
      for (i = 0, len1 = ref.length; i < len1; i++) {
        plugin = ref[i];
        if (plugin.reload && plugin.reload(path, options)) {
          return;
        }
      }
      if (options.liveCSS && path.match(/\.css(?:\.map)?$/i)) {
        if (this.reloadStylesheet(path)) {
          return;
        }
      }
      if (options.liveImg && path.match(/\.(jpe?g|png|gif)$/i)) {
        this.reloadImages(path);
        return;
      }
      if (options.isChromeExtension) {
        this.reloadChromeExtension();
        return;
      }
      return this.reloadPage();
    }

    reloadPage() {
      return this.window.document.location.reload();
    }

    reloadChromeExtension() {
      return this.window.chrome.runtime.reload();
    }

    reloadImages(path) {
      var expando, i, img, j, k, len1, len2, len3, len4, m, ref, ref1, ref2, results1, selector, styleNames, styleSheet;
      expando = this.generateUniqueString();
      ref = this.document.images;
      for (i = 0, len1 = ref.length; i < len1; i++) {
        img = ref[i];
        if (pathsMatch(path, pathFromUrl(img.src))) {
          img.src = this.generateCacheBustUrl(img.src, expando);
        }
      }
      if (this.document.querySelectorAll) {
        for (j = 0, len2 = IMAGE_STYLES.length; j < len2; j++) {
          ({selector, styleNames} = IMAGE_STYLES[j]);
          ref1 = this.document.querySelectorAll(`[style*=${selector}]`);
          for (k = 0, len3 = ref1.length; k < len3; k++) {
            img = ref1[k];
            this.reloadStyleImages(img.style, styleNames, path, expando);
          }
        }
      }
      if (this.document.styleSheets) {
        ref2 = this.document.styleSheets;
        results1 = [];
        for (m = 0, len4 = ref2.length; m < len4; m++) {
          styleSheet = ref2[m];
          results1.push(this.reloadStylesheetImages(styleSheet, path, expando));
        }
        return results1;
      }
    }

    reloadStylesheetImages(styleSheet, path, expando) {
      var e, i, j, len1, len2, rule, rules, styleNames;
      try {
        rules = styleSheet != null ? styleSheet.cssRules : void 0;
      } catch (error) {
        e = error;
      }
      
      if (!rules) {
        return;
      }
      for (i = 0, len1 = rules.length; i < len1; i++) {
        rule = rules[i];
        switch (rule.type) {
          case CSSRule.IMPORT_RULE:
            this.reloadStylesheetImages(rule.styleSheet, path, expando);
            break;
          case CSSRule.STYLE_RULE:
            for (j = 0, len2 = IMAGE_STYLES.length; j < len2; j++) {
              ({styleNames} = IMAGE_STYLES[j]);
              this.reloadStyleImages(rule.style, styleNames, path, expando);
            }
            break;
          case CSSRule.MEDIA_RULE:
            this.reloadStylesheetImages(rule, path, expando);
        }
      }
    }

    reloadStyleImages(style, styleNames, path, expando) {
      var i, len1, newValue, styleName, value;
      for (i = 0, len1 = styleNames.length; i < len1; i++) {
        styleName = styleNames[i];
        value = style[styleName];
        if (typeof value === 'string') {
          newValue = value.replace(/\burl\s*\(([^)]*)\)/, (match, src) => {
            if (pathsMatch(path, pathFromUrl(src))) {
              return `url(${this.generateCacheBustUrl(src, expando)})`;
            } else {
              return match;
            }
          });
          if (newValue !== value) {
            style[styleName] = newValue;
          }
        }
      }
    }

    reloadStylesheet(path) {
      var i, imported, j, k, len1, len2, len3, len4, link, links, m, match, ref, ref1, style;
      // has to be a real array, because DOMNodeList will be modified
      links = (function() {
        var i, len1, ref, results1;
        ref = this.document.getElementsByTagName('link');
        results1 = [];
        for (i = 0, len1 = ref.length; i < len1; i++) {
          link = ref[i];
          if (link.rel.match(/^stylesheet$/i) && !link.__LiveReload_pendingRemoval) {
            results1.push(link);
          }
        }
        return results1;
      }).call(this);
      // find all imported stylesheets
      imported = [];
      ref = this.document.getElementsByTagName('style');
      for (i = 0, len1 = ref.length; i < len1; i++) {
        style = ref[i];
        if (style.sheet) {
          this.collectImportedStylesheets(style, style.sheet, imported);
        }
      }
      for (j = 0, len2 = links.length; j < len2; j++) {
        link = links[j];
        this.collectImportedStylesheets(link, link.sheet, imported);
      }
      // handle prefixfree
      if (this.window.StyleFix && this.document.querySelectorAll) {
        ref1 = this.document.querySelectorAll('style[data-href]');
        for (k = 0, len3 = ref1.length; k < len3; k++) {
          style = ref1[k];
          links.push(style);
        }
      }
      this.console.log(`LiveReload found ${links.length} LINKed stylesheets, ${imported.length} @imported stylesheets`);
      match = pickBestMatch(path, links.concat(imported), (l) => {
        return pathFromUrl(this.linkHref(l));
      });
      if (match) {
        if (match.object.rule) {
          this.console.log(`LiveReload is reloading imported stylesheet: ${match.object.href}`);
          this.reattachImportedRule(match.object);
        } else {
          this.console.log(`LiveReload is reloading stylesheet: ${this.linkHref(match.object)}`);
          this.reattachStylesheetLink(match.object);
        }
      } else {
        if (this.options.reloadMissingCSS) {
          this.console.log(`LiveReload will reload all stylesheets because path '${path}' did not match any specific one. To disable this behavior, set 'options.reloadMissingCSS' to 'false'.`);
          for (m = 0, len4 = links.length; m < len4; m++) {
            link = links[m];
            this.reattachStylesheetLink(link);
          }
        } else {
          this.console.log(`LiveReload will not reload path '${path}' because the stylesheet was not found on the page and 'options.reloadMissingCSS' was set to 'false'.`);
        }
      }
      return true;
    }

    collectImportedStylesheets(link, styleSheet, result) {
      var e, i, index, len1, rule, rules;
      try {
        // in WebKit, styleSheet.cssRules is null for inaccessible stylesheets;
        // Firefox/Opera may throw exceptions
        rules = styleSheet != null ? styleSheet.cssRules : void 0;
      } catch (error) {
        e = error;
      }
      
      if (rules && rules.length) {
        for (index = i = 0, len1 = rules.length; i < len1; index = ++i) {
          rule = rules[index];
          switch (rule.type) {
            case CSSRule.CHARSET_RULE:
              continue; // do nothing
            case CSSRule.IMPORT_RULE:
              result.push({
                link,
                rule,
                index,
                href: rule.href
              });
              this.collectImportedStylesheets(link, rule.styleSheet, result);
              break;
            default:
              break; // import rules can only be preceded by charset rules
          }
        }
      }
    }

    waitUntilCssLoads(clone, func) {
      var callbackExecuted, executeCallback, poll;
      callbackExecuted = false;
      executeCallback = () => {
        if (callbackExecuted) {
          return;
        }
        callbackExecuted = true;
        return func();
      };
      // supported by Chrome 19+, Safari 5.2+, Firefox 9+, Opera 9+, IE6+
      // http://www.zachleat.com/web/load-css-dynamically/
      // http://pieisgood.org/test/script-link-events/
      clone.onload = () => {
        this.console.log("LiveReload: the new stylesheet has finished loading");
        this.knownToSupportCssOnLoad = true;
        return executeCallback();
      };
      if (!this.knownToSupportCssOnLoad) {
        // polling
        (poll = () => {
          if (clone.sheet) {
            this.console.log("LiveReload is polling until the new CSS finishes loading...");
            return executeCallback();
          } else {
            return this.Timer.start(50, poll);
          }
        })();
      }
      // fail safe
      return this.Timer.start(this.options.stylesheetReloadTimeout, executeCallback);
    }

    linkHref(link) {
      // prefixfree uses data-href when it turns LINK into STYLE
      return link.href || link.getAttribute('data-href');
    }

    reattachStylesheetLink(link) {
      var clone, parent;
      // ignore LINKs that will be removed by LR soon
      if (link.__LiveReload_pendingRemoval) {
        return;
      }
      link.__LiveReload_pendingRemoval = true;
      if (link.tagName === 'STYLE') {
        // prefixfree
        clone = this.document.createElement('link');
        clone.rel = 'stylesheet';
        clone.media = link.media;
        clone.disabled = link.disabled;
      } else {
        clone = link.cloneNode(false);
      }
      clone.href = this.generateCacheBustUrl(this.linkHref(link));
      // insert the new LINK before the old one
      parent = link.parentNode;
      if (parent.lastChild === link) {
        parent.appendChild(clone);
      } else {
        parent.insertBefore(clone, link.nextSibling);
      }
      return this.waitUntilCssLoads(clone, () => {
        var additionalWaitingTime;
        if (/AppleWebKit/.test(navigator.userAgent)) {
          additionalWaitingTime = 5;
        } else {
          additionalWaitingTime = 200;
        }
        return this.Timer.start(additionalWaitingTime, () => {
          var ref;
          if (!link.parentNode) {
            return;
          }
          link.parentNode.removeChild(link);
          clone.onreadystatechange = null;
          return (ref = this.window.StyleFix) != null ? ref.link(clone) : void 0; // prefixfree
        });
      });
    }

    reattachImportedRule({rule, index, link}) {
      var href, media, newRule, parent, tempLink;
      parent = rule.parentStyleSheet;
      href = this.generateCacheBustUrl(rule.href);
      media = rule.media.length ? [].join.call(rule.media, ', ') : '';
      newRule = `@import url("${href}") ${media};`;
      // used to detect if reattachImportedRule has been called again on the same rule
      rule.__LiveReload_newHref = href;
      // WORKAROUND FOR WEBKIT BUG: WebKit resets all styles if we add @import'ed
      // stylesheet that hasn't been cached yet. Workaround is to pre-cache the
      // stylesheet by temporarily adding it as a LINK tag.
      tempLink = this.document.createElement("link");
      tempLink.rel = 'stylesheet';
      tempLink.href = href;
      tempLink.__LiveReload_pendingRemoval = true; // exclude from path matching
      if (link.parentNode) {
        link.parentNode.insertBefore(tempLink, link);
      }
      // wait for it to load
      return this.Timer.start(this.importCacheWaitPeriod, () => {
        if (tempLink.parentNode) {
          tempLink.parentNode.removeChild(tempLink);
        }
        // if another reattachImportedRule call is in progress, abandon this one
        if (rule.__LiveReload_newHref !== href) {
          return;
        }
        parent.insertRule(newRule, index);
        parent.deleteRule(index + 1);
        // save the new rule, so that we can detect another reattachImportedRule call
        rule = parent.cssRules[index];
        rule.__LiveReload_newHref = href;
        // repeat again for good measure
        return this.Timer.start(this.importCacheWaitPeriod, () => {
          // if another reattachImportedRule call is in progress, abandon this one
          if (rule.__LiveReload_newHref !== href) {
            return;
          }
          parent.insertRule(newRule, index);
          return parent.deleteRule(index + 1);
        });
      });
    }

    generateUniqueString() {
      return 'livereload=' + Date.now();
    }

    generateCacheBustUrl(url, expando = this.generateUniqueString()) {
      var hash, oldParams, originalUrl, params;
      ({
        url,
        hash,
        params: oldParams
      } = splitUrl(url));
      if (this.options.overrideURL) {
        if (url.indexOf(this.options.serverURL) < 0) {
          originalUrl = url;
          url = this.options.serverURL + this.options.overrideURL + "?url=" + encodeURIComponent(url);
          this.console.log(`LiveReload is overriding source URL ${originalUrl} with ${url}`);
        }
      }
      params = oldParams.replace(/(\?|&)livereload=(\d+)/, function(match, sep) {
        return `${sep}${expando}`;
      });
      if (params === oldParams) {
        if (oldParams.length === 0) {
          params = `?${expando}`;
        } else {
          params = `${oldParams}&${expando}`;
        }
      }
      return url + params + hash;
    }

  };

}).call(this);

},{}],8:[function(require,module,exports){
(function() {
  var CustomEvents, LiveReload, k;

  CustomEvents = require('./customevents');

  LiveReload = window.LiveReload = new (require('./livereload').LiveReload)(window);

  for (k in window) {
    if (k.match(/^LiveReloadPlugin/)) {
      LiveReload.addPlugin(window[k]);
    }
  }

  LiveReload.addPlugin(require('./less'));

  LiveReload.on('shutdown', function() {
    return delete window.LiveReload;
  });

  LiveReload.on('connect', function() {
    return CustomEvents.fire(document, 'LiveReloadConnect');
  });

  LiveReload.on('disconnect', function() {
    return CustomEvents.fire(document, 'LiveReloadDisconnect');
  });

  CustomEvents.bind(document, 'LiveReloadShutDown', function() {
    return LiveReload.shutDown();
  });

}).call(this);

},{"./customevents":2,"./less":3,"./livereload":4}],9:[function(require,module,exports){
(function() {
  var Timer;

  exports.Timer = Timer = class Timer {
    constructor(func1) {
      this.func = func1;
      this.running = false;
      this.id = null;
      this._handler = () => {
        this.running = false;
        this.id = null;
        return this.func();
      };
    }

    start(timeout) {
      if (this.running) {
        clearTimeout(this.id);
      }
      this.id = setTimeout(this._handler, timeout);
      return this.running = true;
    }

    stop() {
      if (this.running) {
        clearTimeout(this.id);
        this.running = false;
        return this.id = null;
      }
    }

  };

  Timer.start = function(timeout, func) {
    return setTimeout(func, timeout);
  };

}).call(this);

},{}]},{},[8]);

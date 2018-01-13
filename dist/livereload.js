var LiveReload = (function () {
'use strict';

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

function bind(element, eventName, handler) {
  if (element.addEventListener) {
    element.addEventListener(eventName, handler, false);
  } else if (element.attachEvent) {
    element[eventName] = 1;
    element.attachEvent('onpropertychange', function(event) {
      if (event.propertyName === eventName) {
        handler();
      }
    });
  } else {
    throw new Error(("Attempt to attach custom event " + eventName + " to something which isn't a DOMElement"))
  }
}

function fire(element, eventName) {
  if (element.addEventListener) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    document.dispatchEvent(event);
  } else if (element.attachEvent) {
    if (element[eventName]) {
      element[eventName]++;
    }
  } else {
    throw new Error(("Attempt to fire custom event " + eventName + " on something which isn't a DOMElement"))
  }
}

var PROTOCOL_6 = 'http://livereload.com/protocols/official-6';
var PROTOCOL_7 = 'http://livereload.com/protocols/official-7';

var ProtocolError = function ProtocolError(reason, data) {
  this.message = "LiveReload protocol error (" + reason + ") after receiving data: \"" + data + "\".";
};

var Parser = function Parser(handlers) {
  this.handlers = handlers;
  this.reset();
};

Parser.prototype.reset = function reset () {
  this.protocol = null;
};

Parser.prototype.process = function process (data) {
  try {
    var message;
    if ((this.protocol == null)) {
      if (data.match(/^!!ver:([\d.]+)$/)) {
        this.protocol = 6;
      } else if (message = this._parseMessage(data, {'hello': true})) {
        if (!message.protocols.length) {
          throw new ProtocolError("no protocols specified in handshake message", data)
        } else if (message.protocols.indexOf(PROTOCOL_7) !== -1) {
          this.protocol = 7;
        } else if (message.protocols.indexOf(PROTOCOL_6) !== -1) {
          this.protocol = 6;
        } else {
          throw new ProtocolError("no supported protocols found", data)
        }
      }
      return this.handlers.connected(this.protocol)
    } else if (this.protocol === 6) {
      message = JSON.parse(data);
      if (!message.length) {
        throw new ProtocolError("protocol 6 messages must be arrays", data)
      }
      var ref = Array.from(message);
        var command = ref[0];
        var options = ref[1];
      if (command !== 'refresh') {
        throw new ProtocolError("unknown protocol 6 command", data)
      }

      this.handlers.message({command: 'reload', path: options.path, liveCSS: options.apply_css_live != null ? options.apply_css_live : true});
    } else {
      message = this._parseMessage(data, {'reload': true, 'alert': true});
      this.handlers.message(message);
    }
  } catch (e) {
    if (e instanceof ProtocolError) {
      this.handlers.error(e);
    } else {
      throw e
    }
  }
};

Parser.prototype._parseMessage = function _parseMessage (data, validCommands) {
  var message;
  try {
    message = JSON.parse(data);
  } catch (e) {
    throw new ProtocolError('unparsable JSON', data)
  }
  if (!message.command) {
    throw new ProtocolError('missing "command" key', data)
  }
  if (!validCommands.hasOwnProperty(message.command)) {
    throw new ProtocolError(("invalid command '" + (message.command) + "'"), data)
  }
  return message
};

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Version = '2.2.2';

var Connector = function Connector(options, WebSocket, Timer, handlers) {
  var this$1 = this;

  this.options = options;
  this.WebSocket = WebSocket;
  this.Timer = Timer;
  this.handlers = handlers;
  this._uri = "ws" + (this.options.https ? "s" : "") + "://" + (this.options.host) + ":" + (this.options.port) + "/livereload";

  this._nextDelay = this.options.mindelay;
  this._connectionDesired = false;
  this.protocol = 0;

  this.protocolParser = new Parser({
    connected: function (protocol) {
      this$1.protocol = protocol;
      this$1._handshakeTimeout.stop();
      this$1._nextDelay = this$1.options.mindelay;
      this$1._disconnectionReason = 'broken';
      return this$1.handlers.connected(protocol);
    },
    error: function (e) {
      this$1.handlers.error(e);
      return this$1._closeOnError();
    },
    message: function (message) {
      return this$1.handlers.message(message);
    }
  });

  this._handshakeTimeout = new Timer(function () {
    if (!this$1._isSocketConnected()) { return; }
    this$1._disconnectionReason = 'handshake-timeout';
    return this$1.socket.close();
  });

  this._reconnectTimer = new Timer(function () {
    if (!this$1._connectionDesired) { return; }// shouldn't hit this, but just in case
    return this$1.connect();
  });

  this.connect();
};


Connector.prototype._isSocketConnected = function _isSocketConnected () {
  return this.socket && (this.socket.readyState === this.WebSocket.OPEN);
};

Connector.prototype.connect = function connect () {
    var this$1 = this;

  this._connectionDesired = true;
  if (this._isSocketConnected()) { return; }

  // prepare for a new connection
  this._reconnectTimer.stop();
  this._disconnectionReason = 'cannot-connect';
  this.protocolParser.reset();

  this.handlers.connecting();

  this.socket = new this.WebSocket(this._uri);
  this.socket.onopen  = function (e) { return this$1._onopen(e); };
  this.socket.onclose = function (e) { return this$1._onclose(e); };
  this.socket.onmessage = function (e) { return this$1._onmessage(e); };
  return this.socket.onerror = function (e) { return this$1._onerror(e); };
};

Connector.prototype.disconnect = function disconnect () {
  this._connectionDesired = false;
  this._reconnectTimer.stop(); // in case it was running
  if (!this._isSocketConnected()) { return; }
  this._disconnectionReason = 'manual';
  return this.socket.close();
};


Connector.prototype._scheduleReconnection = function _scheduleReconnection () {
  if (!this._connectionDesired) { return; }// don't reconnect after manual disconnection
  if (!this._reconnectTimer.running) {
    this._reconnectTimer.start(this._nextDelay);
    return this._nextDelay = Math.min(this.options.maxdelay, this._nextDelay * 2);
  }
};

Connector.prototype.sendCommand = function sendCommand (command) {
  if (this.protocol == null) { return; }
  return this._sendCommand(command);
};

Connector.prototype._sendCommand = function _sendCommand (command) {
  return this.socket.send(JSON.stringify(command));
};

Connector.prototype._closeOnError = function _closeOnError () {
  this._handshakeTimeout.stop();
  this._disconnectionReason = 'error';
  return this.socket.close();
};

Connector.prototype._onopen = function _onopen (e) {
  this.handlers.socketConnected();
  this._disconnectionReason = 'handshake-failed';

  // start handshake
  var hello = { command: 'hello', protocols: [PROTOCOL_6, PROTOCOL_7] };
  hello.ver   = Version;
  if (this.options.ext) { hello.ext   = this.options.ext; }
  if (this.options.extver) { hello.extver= this.options.extver; }
  if (this.options.snipver) { hello.snipver = this.options.snipver; }
  this._sendCommand(hello);
  return this._handshakeTimeout.start(this.options.handshake_timeout);
};

Connector.prototype._onclose = function _onclose (e) {
  this.protocol = 0;
  this.handlers.disconnected(this._disconnectionReason, this._nextDelay);
  return this._scheduleReconnection();
};

Connector.prototype._onerror = function _onerror (e) {};

Connector.prototype._onmessage = function _onmessage (e) {
  return this.protocolParser.process(e.data);
};

var Timer = function Timer(func) {
  this.func = func;
  this.running = false;
  this.id = null;
  this._tick = this._tick.bind(this);
};

Timer.prototype.start = function start (timeout) {
  if (this.running) {
    clearTimeout(this.id);
  }
  this.id = setTimeout(this._tick, timeout);
  this.running = true;
};

Timer.prototype.stop = function stop () {
  if (this.running) {
    clearTimeout(this.id);
    this.running = false;
    this.id = null;
  }
};

Timer.prototype._tick = function _tick () {
  this.running = false;
  this.id = null;
  this.func();
};

Timer.start = function start (timeout, func) {
  setTimeout(func, timeout);
};

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Options = function Options() {
  this.https = false;
  this.host  = null;
  this.port  = 35729;

  this.snipver = null;
  this.ext   = null;
  this.extver= null;

  this.mindelay = 1000;
  this.maxdelay = 60000;
  this.handshake_timeout = 5000;
};

Options.prototype.set = function set (name, value) {
  if (typeof value === 'undefined') {
    return
  }

  if (!isNaN(+value)) {
    value = +value;
  }

  this[name] = value;
};

function extractOptions(document) {
  var elements = document.getElementsByTagName('script');
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];

    var m, src;
    if ((src = element.src) && (m = src.match(new RegExp("^[^:]+://(.*)/z?livereload\\.js(?:\\?(.*))?$")))) {
      var mm;
      var options = new Options();
      options.https = src.indexOf("https") === 0;
      if (mm = m[1].match(new RegExp("^([^/:]+)(?::(\\d+))?$"))) {
        options.host = mm[1];
        if (mm[2]) {
          options.port = parseInt(mm[2], 10);
        }
      }

      if (m[2]) {
        for (var i$1 = 0, list = Array.from(m[2].split('&')); i$1 < list.length; i$1 += 1) {
          var pair = list[i$1];

          var keyAndValue;
          if ((keyAndValue = pair.split('=')).length > 1) {
            options.set(keyAndValue[0].replace(/-/g, '_'), keyAndValue.slice(1).join('='));
          }
        }
      }
      return options
    }
  }

  return null
}

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Reloader;
var splitUrl = function(url) {
  var hash, index, params;
  if ((index = url.indexOf('#')) >= 0) {
    hash = url.slice(index);
    url = url.slice(0, index);
  } else {
    hash = '';
  }

  if ((index = url.indexOf('?')) >= 0) {
    params = url.slice(index);
    url = url.slice(0, index);
  } else {
    params = '';
  }

  return { url: url, params: params, hash: hash };
};

var pathFromUrl = function(url) {
  var path;
  var assign;
  ((assign = splitUrl(url), url = assign.url));
  if (url.indexOf('file://') === 0) {
    path = url.replace(new RegExp("^file://(localhost)?"), '');
  } else {
    //                        http  :   // hostname  :8080  /
    path = url.replace(new RegExp("^([^:]+:)?//([^:/]+)(:\\d*)?/"), '/');
  }

  // decodeURI has special handling of stuff like semicolons, so use decodeURIComponent
  return decodeURIComponent(path);
};

var pickBestMatch = function(path, objects, pathFunc) {
  var score;
  var bestMatch = { score: 0 };
  for (var i = 0, list = Array.from(objects); i < list.length; i += 1) {
    var object = list[i];

    score = numberOfMatchingSegments(path, pathFunc(object));
    if (score > bestMatch.score) {
      bestMatch = { object: object, score: score };
    }
  }

  if (bestMatch.score > 0) { return bestMatch; } else { return null; }
};

var numberOfMatchingSegments = function(path1, path2) {
  // get rid of leading slashes and normalize to lower case
  path1 = path1.replace(/^\/+/, '').toLowerCase();
  path2 = path2.replace(/^\/+/, '').toLowerCase();

  if (path1 === path2) { return 10000; }

  var comps1 = path1.split('/').reverse();
  var comps2 = path2.split('/').reverse();
  var len = Math.min(comps1.length, comps2.length);

  var eqCount = 0;
  while ((eqCount < len) && (comps1[eqCount] === comps2[eqCount])) {
    ++eqCount;
  }

  return eqCount;
};

var pathsMatch = function (path1, path2) { return numberOfMatchingSegments(path1, path2) > 0; };


var IMAGE_STYLES = [
  { selector: 'background', styleNames: ['backgroundImage'] },
  { selector: 'border', styleNames: ['borderImage', 'webkitBorderImage', 'MozBorderImage'] }
];


var Reloader = function Reloader(window, console, Timer) {
  this.window = window;
  this.console = console;
  this.Timer = Timer;
  this.document = this.window.document;
  this.importCacheWaitPeriod = 200;
  this.plugins = [];
};


Reloader.prototype.addPlugin = function addPlugin (plugin) {
  return this.plugins.push(plugin);
};


Reloader.prototype.analyze = function analyze (callback) {
  return results;
};


Reloader.prototype.reload = function reload (path, options) {
    var this$1 = this;

  this.options = options;// avoid passing it through all the funcs
  if (this.options.stylesheetReloadTimeout == null) { this.options.stylesheetReloadTimeout = 15000; }
  for (var i = 0, list = Array.from(this$1.plugins); i < list.length; i += 1) {
    var plugin = list[i];

      if (plugin.reload && plugin.reload(path, options)) {
      return;
    }
  }
  if (options.liveCSS) {
    if (path.match(/\.css$/i)) {
      if (this.reloadStylesheet(path)) { return; }
    }
  }
  if (options.liveImg) {
    if (path.match(/\.(jpe?g|png|gif)$/i)) {
      this.reloadImages(path);
      return;
    }
  }
  return this.reloadPage();
};


Reloader.prototype.reloadPage = function reloadPage () {
  return this.window.document.location.reload();
};


Reloader.prototype.reloadImages = function reloadImages (path) {
    var this$1 = this;

  var expando = this.generateUniqueString();

  for (var i = 0, list = Array.from(this$1.document.images); i < list.length; i += 1) {
    var img = list[i];

      if (pathsMatch(path, pathFromUrl(img.src))) {
      img.src = this$1.generateCacheBustUrl(img.src, expando);
    }
  }

  if (this.document.querySelectorAll) {
    for (var i$2 = 0, list$2 = Array.from(IMAGE_STYLES); i$2 < list$2.length; i$2 += 1) {
      var ref = list$2[i$2];
        var selector = ref.selector;
        var styleNames = ref.styleNames;

        for (var i$1 = 0, list$1 = Array.from(this$1.document.querySelectorAll(("[style*=" + selector + "]"))); i$1 < list$1.length; i$1 += 1) {
        img = list$1[i$1];

          this$1.reloadStyleImages(img.style, styleNames, path, expando);
      }
    }
  }

  if (this.document.styleSheets) {
    return Array.from(this.document.styleSheets).map(function (styleSheet) { return this$1.reloadStylesheetImages(styleSheet, path, expando); });
  }
};


Reloader.prototype.reloadStylesheetImages = function reloadStylesheetImages (styleSheet, path, expando) {
    var this$1 = this;

  var rules;
  try {
    rules = styleSheet != null ? styleSheet.cssRules : undefined;
  } catch (e) {}
    //
  if (!rules) { return; }

  for (var i$1 = 0, list$1 = Array.from(rules); i$1 < list$1.length; i$1 += 1) {
    var rule = list$1[i$1];

      switch (rule.type) {
      case CSSRule.IMPORT_RULE:
        this$1.reloadStylesheetImages(rule.styleSheet, path, expando);
        break;
      case CSSRule.STYLE_RULE:
        for (var i = 0, list = Array.from(IMAGE_STYLES); i < list.length; i += 1) {
          var ref = list[i];
        var styleNames = ref.styleNames;

        this$1.reloadStyleImages(rule.style, styleNames, path, expando);
        }
        break;
      case CSSRule.MEDIA_RULE:
        this$1.reloadStylesheetImages(rule, path, expando);
        break;
    }
  }

};


Reloader.prototype.reloadStyleImages = function reloadStyleImages (style, styleNames, path, expando) {
    var this$1 = this;

  for (var i = 0, list = Array.from(styleNames); i < list.length; i += 1) {
    var styleName = list[i];

      var value = style[styleName];
    if (typeof value === 'string') {
      var newValue = value.replace(new RegExp("\\burl\\s*\\(([^)]*)\\)"), function (match, src) {
        if (pathsMatch(path, pathFromUrl(src))) {
          return ("url(" + (this$1.generateCacheBustUrl(src, expando)) + ")");
        } else {
          return match;
        }
      });
      if (newValue !== value) {
        style[styleName] = newValue;
      }
    }
  }
};


Reloader.prototype.reloadStylesheet = function reloadStylesheet (path) {
    var this$1 = this;

  // has to be a real array, because DOMNodeList will be modified
  var link;
  var links = ((function () {
    var result = [];
    for (var i = 0, list = Array.from(this$1.document.getElementsByTagName('link')); i < list.length; i += 1) {       link = list[i];

        if (link.rel.match(/^stylesheet$/i) && !link.__LiveReload_pendingRemoval) {
        result.push(link);
      }
    }
    return result;
  })());

  // find all imported stylesheets
  var imported = [];
  for (var i = 0, list = Array.from(this$1.document.getElementsByTagName('style')); i < list.length; i += 1) {
    var style = list[i];

      if (style.sheet) {
      this$1.collectImportedStylesheets(style, style.sheet, imported);
    }
  }
  for (var i$1 = 0, list$1 = Array.from(links); i$1 < list$1.length; i$1 += 1) {
    link = list$1[i$1];

      this$1.collectImportedStylesheets(link, link.sheet, imported);
  }

  // handle prefixfree
  if (this.window.StyleFix && this.document.querySelectorAll) {
    for (var i$2 = 0, list$2 = Array.from(this$1.document.querySelectorAll('style[data-href]')); i$2 < list$2.length; i$2 += 1) {
      style = list$2[i$2];

        links.push(style);
    }
  }

  this.console.log(("LiveReload found " + (links.length) + " LINKed stylesheets, " + (imported.length) + " @imported stylesheets"));
  var match = pickBestMatch(path, links.concat(imported), function (l) { return pathFromUrl(this$1.linkHref(l)); });

  if (match) {
    if (match.object.rule) {
      this.console.log(("LiveReload is reloading imported stylesheet: " + (match.object.href)));
      this.reattachImportedRule(match.object);
    } else {
      this.console.log(("LiveReload is reloading stylesheet: " + (this.linkHref(match.object))));
      this.reattachStylesheetLink(match.object);
    }
  } else {
    this.console.log(("LiveReload will reload all stylesheets because path '" + path + "' did not match any specific one"));
    for (var i$3 = 0, list$3 = Array.from(links); i$3 < list$3.length; i$3 += 1) {
      link = list$3[i$3];

        this$1.reattachStylesheetLink(link);
    }
  }
  return true;
};


Reloader.prototype.collectImportedStylesheets = function collectImportedStylesheets (link, styleSheet, result) {
    var this$1 = this;

  // in WebKit, styleSheet.cssRules is null for inaccessible stylesheets;
  // Firefox/Opera may throw exceptions
  var rules;
  try {
    rules = styleSheet != null ? styleSheet.cssRules : undefined;
  } catch (e) {}
    //
  if (rules && rules.length) {
    for (var index = 0; index < rules.length; index++) {
      var rule = rules[index];
      switch (rule.type) {
        case CSSRule.CHARSET_RULE:
          continue; // do nothing
          break;
        case CSSRule.IMPORT_RULE:
          result.push({ link: link, rule: rule, index: index, href: rule.href });
          this$1.collectImportedStylesheets(link, rule.styleSheet, result);
          break;
        default:
          break;// import rules can only be preceded by charset rules
      }
    }
  }
};


Reloader.prototype.waitUntilCssLoads = function waitUntilCssLoads (clone, func) {
    var this$1 = this;

  var callbackExecuted = false;

  var executeCallback = function () {
    if (callbackExecuted) { return; }
    callbackExecuted = true;
    return func();
  };

  // supported by Chrome 19+, Safari 5.2+, Firefox 9+, Opera 9+, IE6+
  // http://www.zachleat.com/web/load-css-dynamically/
  // http://pieisgood.org/test/script-link-events/
  clone.onload = function () {
    this$1.console.log("LiveReload: the new stylesheet has finished loading");
    this$1.knownToSupportCssOnLoad = true;
    return executeCallback();
  };

  if (!this.knownToSupportCssOnLoad) {
    // polling
    var poll;
    (poll = function () {
      if (clone.sheet) {
        this$1.console.log("LiveReload is polling until the new CSS finishes loading...");
        return executeCallback();
      } else {
        return this$1.Timer.start(50, poll);
      }
    })();
  }

  // fail safe
  return this.Timer.start(this.options.stylesheetReloadTimeout, executeCallback);
};


Reloader.prototype.linkHref = function linkHref (link) {
  // prefixfree uses data-href when it turns LINK into STYLE
  return link.href || link.getAttribute('data-href');
};


Reloader.prototype.reattachStylesheetLink = function reattachStylesheetLink (link) {
    var this$1 = this;

  // ignore LINKs that will be removed by LR soon
  var clone;
  if (link.__LiveReload_pendingRemoval) { return; }
  link.__LiveReload_pendingRemoval = true;

  if (link.tagName === 'STYLE') {
    // prefixfree
    clone = this.document.createElement('link');
    clone.rel    = 'stylesheet';
    clone.media  = link.media;
    clone.disabled = link.disabled;
  } else {
    clone = link.cloneNode(false);
  }

  clone.href = this.generateCacheBustUrl(this.linkHref(link));

  // insert the new LINK before the old one
  var parent = link.parentNode;
  if (parent.lastChild === link) {
      parent.appendChild(clone);
  } else {
      parent.insertBefore(clone, link.nextSibling);
    }

  return this.waitUntilCssLoads(clone, function () {
    var additionalWaitingTime;
    if (/AppleWebKit/.test(navigator.userAgent)) {
      additionalWaitingTime = 5;
    } else {
      additionalWaitingTime = 200;
    }

    return this$1.Timer.start(additionalWaitingTime, function () {
      if (!link.parentNode) { return; }
      link.parentNode.removeChild(link);
      clone.onreadystatechange = null;

      return (this$1.window.StyleFix != null ? this$1.window.StyleFix.link(clone) : undefined);
    });
  }); // prefixfree
};


Reloader.prototype.reattachImportedRule = function reattachImportedRule (ref) {
    var this$1 = this;
    var rule = ref.rule;
    var index = ref.index;
    var link = ref.link;

  var parent= rule.parentStyleSheet;
  var href  = this.generateCacheBustUrl(rule.href);
  var media = rule.media.length ? [].join.call(rule.media, ', ') : '';
  var newRule = "@import url(\"" + href + "\") " + media + ";";

  // used to detect if reattachImportedRule has been called again on the same rule
  rule.__LiveReload_newHref = href;

  // WORKAROUND FOR WEBKIT BUG: WebKit resets all styles if we add @import'ed
  // stylesheet that hasn't been cached yet. Workaround is to pre-cache the
  // stylesheet by temporarily adding it as a LINK tag.
  var tempLink = this.document.createElement("link");
  tempLink.rel = 'stylesheet';
  tempLink.href = href;
  tempLink.__LiveReload_pendingRemoval = true;// exclude from path matching
  if (link.parentNode) {
    link.parentNode.insertBefore(tempLink, link);
  }

  // wait for it to load
  return this.Timer.start(this.importCacheWaitPeriod, function () {
    if (tempLink.parentNode) { tempLink.parentNode.removeChild(tempLink); }

    // if another reattachImportedRule call is in progress, abandon this one
    if (rule.__LiveReload_newHref !== href) { return; }

    parent.insertRule(newRule, index);
    parent.deleteRule(index+1);

    // save the new rule, so that we can detect another reattachImportedRule call
    rule = parent.cssRules[index];
    rule.__LiveReload_newHref = href;

    // repeat again for good measure
    return this$1.Timer.start(this$1.importCacheWaitPeriod, function () {
      // if another reattachImportedRule call is in progress, abandon this one
      if (rule.__LiveReload_newHref !== href) { return; }

      parent.insertRule(newRule, index);
      return parent.deleteRule(index+1);
    });
  });
};


Reloader.prototype.generateUniqueString = function generateUniqueString () {
  return ("livereload=" + (Date.now()));
};


Reloader.prototype.generateCacheBustUrl = function generateCacheBustUrl (url, expando) {
  var hash, oldParams;
  if (expando == null) { expando = this.generateUniqueString(); }
  var assign;
    ((assign = splitUrl(url), url = assign.url, hash = assign.hash, oldParams = assign.params));

  if (this.options.overrideURL) {
    if (url.indexOf(this.options.serverURL) < 0) {
      var originalUrl = url;
      url = this.options.serverURL + this.options.overrideURL + "?url=" + encodeURIComponent(url);
      this.console.log(("LiveReload is overriding source URL " + originalUrl + " with " + url));
    }
  }

  var params = oldParams.replace(/(\?|&)livereload=(\d+)/, function (match, sep) { return ("" + sep + expando); });
  if (params === oldParams) {
    if (oldParams.length === 0) {
      params = "?" + expando;
    } else {
      params = oldParams + "&" + expando;
    }
  }

  return url + params + hash;
};

var Reloader$1 = Reloader;

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var LiveReload = function LiveReload(window) {
  var this$1 = this;

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
        log: function log() {},
        error: this.window.console.error.bind(this.window.console)
      }
    :{
      log: function log() {},
      error: function error() {}
    };

  // i can haz sockets?
  if (!(this.WebSocket = this.window.WebSocket || this.window.MozWebSocket)) {
    this.console.error("LiveReload disabled because the browser does not seem to support web sockets");
    return;
  }

  // i can haz options?
  if ('LiveReloadOptions' in window) {
    this.options = new Options();
    for (var i = 0, list = Object.keys(window['LiveReloadOptions'] || {}); i < list.length; i += 1) {
      var k = list[i];

      var v = window['LiveReloadOptions'][k];
      this$1.options.set(k, v);
    }
  } else {
    this.options = extractOptions(this.window.document);
    if (!this.options) {
      this.console.error("LiveReload disabled because it could not find its own <SCRIPT> tag");
      return;
    }
  }

  // i can haz reloader?
  this.reloader = new Reloader$1(this.window, this.console, Timer);

  // i can haz connection?
  this.connector = new Connector(this.options, this.WebSocket, Timer, {
    connecting: function () {},

    socketConnected: function () {},

    connected: function (protocol) {
      if (typeof this$1.listeners.connect === 'function') {
        this$1.listeners.connect();
      }
      this$1.log(("LiveReload is connected to " + (this$1.options.host) + ":" + (this$1.options.port) + " (protocol v" + protocol + ")."));
      return this$1.analyze();
    },

    error: function (e) {
      if (e instanceof ProtocolError) {
        if (typeof console !== 'undefined' && console !== null) { return console.log(((e.message) + ".")); }
      } else {
        if (typeof console !== 'undefined' && console !== null) { return console.log(("LiveReload internal error: " + (e.message))); }
      }
    },

    disconnected: function (reason, nextDelay) {
      if (typeof this$1.listeners.disconnect === 'function') {
        this$1.listeners.disconnect();
      }
      switch (reason) {
        case 'cannot-connect':
          return this$1.log(("LiveReload cannot connect to " + (this$1.options.host) + ":" + (this$1.options.port) + ", will retry in " + nextDelay + " sec."));
        case 'broken':
          return this$1.log(("LiveReload disconnected from " + (this$1.options.host) + ":" + (this$1.options.port) + ", reconnecting in " + nextDelay + " sec."));
        case 'handshake-timeout':
          return this$1.log(("LiveReload cannot connect to " + (this$1.options.host) + ":" + (this$1.options.port) + " (handshake timeout), will retry in " + nextDelay + " sec."));
        case 'handshake-failed':
          return this$1.log(("LiveReload cannot connect to " + (this$1.options.host) + ":" + (this$1.options.port) + " (handshake failed), will retry in " + nextDelay + " sec."));
        case 'manual': //nop
        case 'error': //nop
        default:
          return this$1.log(("LiveReload disconnected from " + (this$1.options.host) + ":" + (this$1.options.port) + " (" + reason + "), reconnecting in " + nextDelay + " sec."));
      }
    },

    message: function (message) {
      switch (message.command) {
        case 'reload': return this$1.performReload(message);
        case 'alert':return this$1.performAlert(message);
      }
    }
  }
  );

  this.initialized = true;
};

LiveReload.prototype.on = function on (eventName, handler) {
  return this.listeners[eventName] = handler;
};

LiveReload.prototype.log = function log (message) {
  return this.console.log(("" + message));
};

LiveReload.prototype.performReload = function performReload (message) {
  this.log(("LiveReload received reload request: " + (JSON.stringify(message, null, 2))));
  return this.reloader.reload(message.path, {
    liveCSS: message.liveCSS != null ? message.liveCSS : true,
    liveImg: message.liveImg != null ? message.liveImg : true,
    originalPath: message.originalPath || '',
    overrideURL: message.overrideURL || '',
    serverURL: ("http://" + (this.options.host) + ":" + (this.options.port))
  }
  );
};

LiveReload.prototype.performAlert = function performAlert (message) {
  return alert(message.message);
};

LiveReload.prototype.shutDown = function shutDown () {
  if (!this.initialized) { return; }
  this.connector.disconnect();
  this.log("LiveReload disconnected.");
  return (typeof this.listeners.shutdown === 'function' ? this.listeners.shutdown() : undefined);
};

LiveReload.prototype.hasPlugin = function hasPlugin (identifier) { return !!this.pluginIdentifiers[identifier]; };

LiveReload.prototype.addPlugin = function addPlugin (pluginClass) {
    var this$1 = this;

  if (!this.initialized) { return; }

  if (this.hasPlugin(pluginClass.identifier)) { return; }
  this.pluginIdentifiers[pluginClass.identifier] = true;

  var plugin = new pluginClass(this.window, {

    // expose internal objects for those who know what they're doing
    // (note that these are private APIs and subject to change at any time!)
    _livereload: this,
    _reloader: this.reloader,
    _connector:this.connector,

    // official API
    console: this.console,
    Timer: Timer,
    generateCacheBustUrl: function (url) { return this$1.reloader.generateCacheBustUrl(url); }
  }
  );

  // API that pluginClass can/must provide:
  //
  // string pluginClass.identifier
  // -- required, globally-unique name of this plugin
  //
  // string pluginClass.version
  // -- required, plugin version number (format %d.%d or %d.%d.%d)
  //
  // plugin = new pluginClass(window, officialLiveReloadAPI)
  // -- required, plugin constructor
  //
  // bool plugin.reload(string path, { bool liveCSS, bool liveImg })
  // -- optional, attemp to reload the given path, return true if handled
  //
  // object plugin.analyze()
  // -- optional, returns plugin-specific information about the current document (to send to the connected server)
  //    (LiveReload 2 server currently only defines 'disable' key in this object; return {disable:true} to disable server-side
  //     compilation of a matching plugin's files)

  this.plugins.push(plugin);
  this.reloader.addPlugin(plugin);
};

LiveReload.prototype.analyze = function analyze () {
    var this$1 = this;

  if (!this.initialized) { return; }
  if (!(this.connector.protocol >= 7)) { return; }

  var pluginsData = {};
  for (var i = 0, list = Array.from(this$1.plugins); i < list.length; i += 1) {
    var plugin = list[i];

      var pluginData;
    pluginsData[plugin.constructor.identifier] = (pluginData = (typeof plugin.analyze === 'function' ? plugin.analyze() : undefined) || {});
    pluginData.version = plugin.constructor.version;
  }

  this.connector.sendCommand({ command: 'info', plugins: pluginsData, url: this.window.location.href });
};

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

var LessPlugin = function LessPlugin(window, host) {
  this.window = window;
  this.host = host;
};

LessPlugin.initClass = function initClass () {
  this.identifier = 'less';
  this.version = '1.0';
};

LessPlugin.prototype.reload = function reload (path, options) {
  if (this.window.less && this.window.less.refresh) {
    if (path.match(/\.less$/i)) {
      return this.reloadLess(path);
    }
    if (options.originalPath.match(/\.less$/i)) {
      return this.reloadLess(options.originalPath);
    }
  }
  return false;
};

LessPlugin.prototype.reloadLess = function reloadLess (path) {
    var this$1 = this;

  var link;
  var links = ((function () {
    var result = [];
    for (var i = 0, list = Array.from(document.getElementsByTagName('link')); i < list.length; i += 1) {         link = list[i];

        if ((link.href && link.rel.match(/^stylesheet\/less$/i)) || (link.rel.match(/stylesheet/i) && link.type.match(/^text\/(x-)?less$/i))) {
        result.push(link);
      }
    }
    return result;
  })());

  if (links.length === 0) { return false; }

  for (var i = 0, list = Array.from(links); i < list.length; i += 1) {
    link = list[i];

      link.href = this$1.host.generateCacheBustUrl(link.href);
  }

  this.host.console.log("LiveReload is asking LESS to recompile all stylesheets");
  this.window.less.refresh(true);
  return true;
};

LessPlugin.prototype.analyze = function analyze () {
  return { disable: !!(this.window.less && this.window.less.refresh) };
};

LessPlugin.initClass();

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var LiveReload$1 = new LiveReload(window);
for (var k in window) {
  if (k.match(/^LiveReloadPlugin/)) {
    LiveReload$1.addPlugin(window[k]);
  }
}

LiveReload$1.addPlugin(LessPlugin);

LiveReload$1.on('shutdown', function () { return delete window.LiveReload; });
LiveReload$1.on('connect', function () { return fire(document, 'LiveReloadConnect'); });
LiveReload$1.on('disconnect', function () { return fire(document, 'LiveReloadDisconnect'); });

bind(document, 'LiveReloadShutDown', function () { return LiveReload$1.shutDown(); });

return LiveReload$1;

}());

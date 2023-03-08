class Options {
  constructor () {
    this.https = false;
    this.host = null;
    let port = 35729; // backing variable for port property closure

    // we allow port to be overridden with a falsy value to indicate
    // that we should not add a port specification to the backend url;
    // port is now either a number, or a non-numeric string
    Object.defineProperty(this, 'port', {
      get () { return port; },
      set (v) { port = (v ? (isNaN(v) ? v : +v) : ''); }
    });

    this.snipver = null;
    this.ext = null;
    this.extver = null;

    this.mindelay = 1000;
    this.maxdelay = 60000;
    this.handshake_timeout = 5000;

    const pluginOrder = [];

    Object.defineProperty(this, 'pluginOrder', {
      get () { return pluginOrder; },
      set (v) { pluginOrder.push.apply(pluginOrder, v.split(/[,;]/)); }
    });
  }

  set (name, value) {
    if (typeof value === 'undefined') {
      return;
    }

    if (!isNaN(+value)) {
      value = +value;
    }

    this[name] = value;
  }
}

Options.extract = function (document) {
  for (const element of Array.from(document.getElementsByTagName('script'))) {
    // eslint-disable-next-line no-var
    var m;
    // eslint-disable-next-line no-var
    var mm;
    const src = element.src;
    const srcAttr = element.getAttribute('src');
    const lrUrlRegexp = /^([^:]+:\/\/([^/:]+|\[[0-9a-f:]+\])(?::(\d+))?\/|\/\/|\/)?([^/].*\/)?z?livereload\.js(?:\?(.*))?$/;
    //                   ^proto:// ^host                      ^port     ^//  ^/   ^folder
    const lrUrlRegexpAttr = /^(?:(?:([^:/]+)?:?)\/{0,2})([^:]+|\[[0-9a-f:]+\])(?::(\d+))?/;
    //                              ^proto             ^host/folder             ^port

    if ((m = src.match(lrUrlRegexp)) && (mm = srcAttr.match(lrUrlRegexpAttr))) {
      const [, , host, port, , params] = m;
      const [, , , portFromAttr] = mm;
      const options = new Options();

      options.https = element.src.indexOf('https') === 0;

      options.host = host;

      // use port number that the script is loaded from as default
      // for explicitly blank value; enables livereload through proxy
      const ourPort = parseInt(port || portFromAttr, 10) || '';

      // if port is specified in script use that as default instead
      options.port = ourPort || options.port;

      if (params) {
        for (const pair of params.split('&')) {
          // eslint-disable-next-line no-var
          var keyAndValue;

          if ((keyAndValue = pair.split('=')).length > 1) {
            options.set(keyAndValue[0].replace(/-/g, '_'), keyAndValue.slice(1).join('='));
          }
        }
      }

      // if port was overwritten by empty value, then revert to using the same
      // port as the script is running from again (note that it shouldn't be
      // coerced to a numeric value, since that will be 0 for the empty string)
      options.port = options.port || ourPort;

      return options;
    }
  }

  return null;
};

exports.Options = Options;

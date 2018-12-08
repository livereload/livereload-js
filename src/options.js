class Options {
  constructor () {
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
  for (let element of Array.from(document.getElementsByTagName('script'))) {
    var m, src;
    if ((src = element.src) && (m = src.match(new RegExp(`^[^:]+://(.*)/z?livereload\\.js(?:\\?(.*))?$`)))) {
      var mm;
      const options = new Options();

      options.https = src.indexOf('https') === 0;

      if ((mm = m[1].match(new RegExp(`^([^/:]+)(?::(\\d+))?(\\/+.*)?$`)))) {
        options.host = mm[1];
        if (mm[2]) {
          options.port = parseInt(mm[2], 10);
        }
      }

      if (m[2]) {
        for (let pair of m[2].split('&')) {
          var keyAndValue;

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

exports.Options = Options;

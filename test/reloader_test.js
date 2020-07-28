const assert = require('assert');
const {
  Reloader,
  splitUrl,
  pathFromUrl,
  numberOfMatchingSegments,
  pickBestMatch,
  pathsMatch
} = require('../src/reloader');
const { Timer } = require('../src/timer');
const { JSDOM } = require('jsdom');

function ThisDocPlugin (window, host) {
  this.window = window;
}

ThisDocPlugin.identifier = 'this-doc';

ThisDocPlugin.version = '1.0';

ThisDocPlugin.prototype.reload = function (path, options) {
  if (
    path !== this.window.location.pathname &&
    path !== this.window.location.pathname + 'index.html'
  ) {
    return true;
  }
};

ThisDocPlugin.prototype.analyze = function () {
  return {
    disable: false // !!(this.window.less && this.window.less.refresh)
  };
};

describe('splitUrl', () => {
  it('should split url', () => {
    const res = splitUrl('https://www.example.com/abc/test.css?def=1#xyz');

    assert.deepStrictEqual(res, {
      url: 'https://www.example.com/abc/test.css',
      params: '?def=1',
      hash: '#xyz'
    });
  });
});

describe('pathFromUrl', () => {
  it('should handle url with only filename', () => {
    const pathname = pathFromUrl('test.css');

    assert.strictEqual(pathname, 'test.css');
  });

  it('should handle url with path and filename', () => {
    const pathname = pathFromUrl('/abc/def/test.css');

    assert.strictEqual(pathname, '/abc/def/test.css');
  });

  it('should parse url', () => {
    const pathname = pathFromUrl('https://www.example.com/abc/test.css');

    assert.strictEqual(pathname, '/abc/test.css');
  });

  it('should parse file url', () => {
    const pathname = pathFromUrl('file://localhost/abc/test.css');

    assert.strictEqual(pathname, '/abc/test.css');
  });
});

describe('numberOfMatchingSegments', () => {
  it('should count matching path parts', () => {
    const res = numberOfMatchingSegments(
      '/Users/abc/def/test.css',
      pathFromUrl('https://www.example.com/abc/test.css')
    );

    assert(res === 1);
  });
});

describe('pickBestMatch', () => {
  it('should return the best match', () => {
    const res = pickBestMatch(
      '/xyz/abc/def/test.css',
      [
        '/abc/example.css',
        '/abc/def/test.css'
      ]
    );

    assert.deepStrictEqual(res, {
      object: '/abc/def/test.css',
      score: 3
    });
  });
});

describe('pathsMatch', () => {
  it('should match paths', () => {
    const res = pathsMatch(
      '/xyz/abc/def/test.css',
      '/abc/test.css'
    );

    assert(res);
  });
});

describe('Reloader', () => {
  it('should be constructable', () => {
    const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');

    const reloader = new Reloader(dom.window, dom.window.console, Timer);

    assert(reloader);
  });

  describe('linkHref()', () => {
    it('should not throw when no value is available', () => {
      const reloader = new Reloader(
        { },
        console,
        Timer
      );

      assert.doesNotThrow(() => {
        reloader.linkHref({});
      });
    });
  });

  describe('reload()', () => {
    it('should reload the page', (done) => {
      const reloader = new Reloader(
        { document: { location: { reload: done } } },
        console,
        Timer
      );

      const message = {
        path: '/abc'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        liveImg: true,
        reloadMissingCSS: true,
        originalPath: '',
        overrideURL: '',
        serverURL: 'http://localhost:9876'
      });
    });

    it('should reload when doc at the same location changed', (done) => {
      const location = {
        pathname: '/1.html',
        reload: done
      };

      const window = {
        document: {
          location
        },
        location
      };

      const reloader = new Reloader(
        window,
        console,
        Timer
      );

      reloader.addPlugin(new ThisDocPlugin(window));

      const message = {
        path: '/1.html'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        liveImg: true,
        reloadMissingCSS: true,
        originalPath: '',
        overrideURL: '',
        serverURL: 'http://localhost:9876'
      });
    });

    it('should not reload when different html changed', (done) => {
      const location = {
        pathname: '/1.html',
        reload () {
          throw new Error('Shall not reload!');
        }
      };

      const window = {
        document: {
          location
        },
        location
      };

      const reloader = new Reloader(
        window,
        console,
        Timer
      );

      reloader.addPlugin(new ThisDocPlugin(window));

      const message = {
        path: '/2.html'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        liveImg: true,
        reloadMissingCSS: true,
        originalPath: '',
        overrideURL: '',
        serverURL: 'http://localhost:9876'
      });

      setTimeout(() => {
        done(); // no reload after 100ms
      }, 100);
    });

    it('should not reload the page with liveCSS and css file updated', (done) => {
      const window = {
        document: {
          location: {
            reload () {
              throw new Error('Shall not reload!');
            }
          },
          getElementsByTagName () { return []; }
        }
      };

      const console = {
        log () {}
      };

      const reloader = new Reloader(
        window,
        console,
        Timer
      );

      const message = {
        path: '/abc.css'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        reloadMissingCSS: false
      });

      setTimeout(() => {
        done(); // no reload after 100ms
      }, 100);
    });
  });

  describe('reload() with plugin order', () => {
    it('should reload with same plugin order', (done) => {
      const window = {
        document: {
          location: { reload: done }
        }
      };

      const reloader = new Reloader(
        window,
        console,
        Timer
      );

      const message = {
        path: '/abc'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        liveImg: true,
        reloadMissingCSS: true,
        originalPath: '',
        overrideURL: '',
        serverURL: 'http://localhost:9876',
        pluginOrder: 'css img extension others'.split(' ')
      });
    });

    it('should not reload with unknown url and no `others` plugin', (done) => {
      const window = {
        document: {
          location: {
            reload () {
              throw new Error('Shall not reload!');
            }
          }
        }
      };

      const reloader = new Reloader(
        window,
        console,
        Timer
      );

      const message = {
        path: '/abc'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        liveImg: true,
        reloadMissingCSS: true,
        originalPath: '',
        overrideURL: '',
        serverURL: 'http://localhost:9876',
        pluginOrder: 'css img extension'.split(' ')
      });

      setTimeout(() => {
        done(); // no reload after 100ms
      }, 100);
    });

    it('should reload anyway', (done) => {
      const window = {
        document: {
          location: {
            reload: done
          }
        }
      };

      const reloader = new Reloader(
        window,
        console,
        Timer
      );

      const message = {
        path: '/abc.css'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        reloadMissingCSS: true,
        pluginOrder: 'others css'.split(' ')
      });
    });

    it('should not reload the page with liveCSS and css file updated', (done) => {
      const window = {
        document: {
          location: {
            reload () {
              throw new Error('Shall not reload!');
            }
          },
          getElementsByTagName () {
            return [];
          }
        }
      };

      const console = {
        log () {}
      };

      const reloader = new Reloader(
        window,
        console,
        Timer
      );

      const message = {
        path: '/abc.css'
      };

      reloader.reload(message.path, {
        liveCSS: true,
        reloadMissingCSS: false,
        pluginOrder: 'css others'.split(' ')
      });

      setTimeout(() => {
        done(); // no reload after 100ms
      }, 100);
    });
  });

  describe('reloadStylesheet', done => {
    it('should handle duplicate filenames', done => {
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="stylesheet" href="http://localhost/abc/test.css">
          <link rel="stylesheet" href="http://localhost/def/test.css">
        </head>
        <body></body>
        </html>
      `);

      const cons = {
        log () {
        }
      };

      const reloader = new Reloader(
        dom.window,
        cons,
        Timer
      );

      reloader.reattachStylesheetLink = function (link) {
        const href = reloader.linkHref(link);

        assert(href === 'http://localhost/def/test.css');

        done();
      };

      reloader.reloadStylesheet(
        '/def/test.css'
      );
    });
  });
});

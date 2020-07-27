const assert = require('assert');
const { Reloader } = require('../src/reloader');
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
});

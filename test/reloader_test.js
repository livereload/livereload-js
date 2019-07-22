const assert = require('assert');
const { Reloader } = require('../src/reloader');
const { Timer } = require('../src/timer');
const { JSDOM } = require('jsdom');

describe('Reloader', () => {
  it('should be constructable', () => {
    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

    const reloader = new Reloader(dom.window, dom.window.console, Timer);

    assert(reloader);
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
  });
});

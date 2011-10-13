LiveReload.js
=============

This repository contains the JavaScript file served to the browsers by various LiveReload servers:

* [LiveReload 2.x GUI for Mac](http://livereload.com/)
* [guard-livereload](https://github.com/guard/guard-livereload)

See [dist/livereload.js](https://github.com/livereload/livereload-js/raw/master/dist/livereload.js) for the latest ready-to-use, reasonably stable version built using the sources in this repository.

It's OK to hot-link to dist/livereload.js from this repository, however it's probably a bad idea because you would loose the ability to use LiveReload offline. We recommend LiveReload server vendors to distribute livereload.js as part of their apps.


Status
------

Done:

* live CSS reloading
* full page reloading
* protocol, WebSocket communication
* CSS @import support

To Do:

* live image reloading
* live JS reloading
* live in-browser LESS.js reloading


Issues & Limitations
--------------------

**Live reloading of imported stylesheets has a 200ms lag.** Modifying a CSS `@import` rule to reference a not-yet-cached file causes WebKit to lose all document styles, so we have to apply a workaround that causes a lag.

Our workaround is to add a temporary LINK element for the imported stylesheet we're trying to reload, wait 200ms to make sure WebKit loads the new file, then remove the LINK tag and recreate the @import rule. This prevents a flash of unstyled content. (We also wait 200 more milliseconds and recreate the @import rule again, in case those initial 200ms were not enough.)


What is LiveReload?
-------------------

LiveReload is a tool for web developers and designers. See [livereload.com](http://livereload.com/) for more info.

LiveReload.js connects to a LiveReload server via web sockets and listens for incoming change notifications. When CSS or image file is modified, it is live-refreshed without reloading the page. When any other file is modified, the page is reloaded.


Reimplementation
----------------

Previously, the described logic has been part of LiveReload browser extensions. This repository contains an effort to reimplement the logic so that it:

* is standalone, [following the new approach to browser extensions](http://help.livereload.com/discussions/suggestions/12),
* is covered with tests,
* is modular and maintainable,
* implements a [new future-proof protocol](http://help.livereload.com/kb/ecosystem/livereload-protocol),
* also supports the legacy protocol for easy migration.

Both old and new protocols are supported, so this file can readily work with existing LiveReload servers.


CommonJS modules
----------------

New code is split into CommonJS-style modules, stitched together using a simple Rakefile.

I've tried to use Stitch.js, but it did not want to autorun startup code from startup.coffee module. The custom-made regexp-ridden approach works so much better (and produces much clearer code).


Running tests
-------------

Use node.js 0.4.x (if you have 0.5.x installed, use nvm) and run:

    expresso -I lib

Get code coverage report (current coverage is about 70%):

    expresso -c -I lib

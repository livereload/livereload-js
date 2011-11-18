LiveReload.js
=============

This repository contains the JavaScript file served to the browsers by various LiveReload servers:

* [LiveReload 2.x GUI for Mac](http://livereload.com/)
* [guard-livereload](https://github.com/guard/guard-livereload)

See [dist/livereload.js](https://github.com/livereload/livereload-js/raw/master/dist/livereload.js) for the latest ready-to-use, reasonably stable version built using the sources in this repository.

It's OK to hot-link to dist/livereload.js from this repository, however it's probably a bad idea because you would lose the ability to use LiveReload offline. We recommend LiveReload server vendors to distribute livereload.js as part of their apps.


Using livereload.js
-------------------

This script is meant to be included into the web pages you want to monitor, like this:

    <script src="http://localhost:35729/livereload.js"></script>

LiveReload 2 server listens on port 35729 and serves livereload.js over HTTP (besides speaking the web socket protocol on the same port).

A slightly smarter way is to use the host name of the current page, assuming that it is being served from the same computer. This approach enables LiveReload when viewing the web page from other devices on the network:

    <script>document.write('<script src="http://'
        + location.host.split(':')[0]
        + ':35729/livereload.js"></'
        + 'script>')</script>

However, `location.host` is empty for file: URLs, so we need to account for that:

    <script>document.write('<script src="http://'
        + (location.host || 'localhost').split(':')[0]
        + ':35729/livereload.js"></'
        + 'script>')</script>

LiveReload.js finds a script tag that includes `.../livereload.js` and uses it to determine the hostname/port to connect to. It also understands some options from the query string: `host`, `port`, `snipver`, `mindelay` and `maxdelay`.

`snipver` specifies a version of the snippet, so that we can warn when the snippet needs to be updated. The currently recommended version 1 of the snippet is:

    <script>document.write('<script src="http://'
        + (location.host || 'localhost').split(':')[0]
        + ':35729/livereload.js?snipver=1"></'
        + 'script>')</script>

Additionally, you might want to specify `mindelay` and `maxdelay`, which is minimum and maximum reconnection delay in milliseconds (defaulting to 1000 and 60000).

Alternatively, instead of loading livereload.js from the LiveReload server, you might want to include it from a different URL. In this case include a `host` parameter to override the host name. For example:

    <script src="https://github.com/livereload/livereload-js/raw/master/dist/livereload.js?host=localhost"></script>


Communicating with livereload.js
--------------------------------

It is possible to communicate with a running LiveReload script using DOM events:

* fire LiveReloadShutDown event on `document` to make LiveReload disconnect and go away
* listen for LiveReloadConnect event on `document` to learn when the connection is established
* listen for LiveReloadDisconnect event on `document` to learn when the connection is interrupted (or fails to be established)

LiveReload object is also exposed as `window.LiveReload`, with `LiveReload.disconnect()`, `LiveReload.connect()` and `LiveReload.shutDown()` being available. However I'm not yet sure if I want to keep this API, so consider it non-contractual (and email me if you have a use for it).


Status
------

Done:

* live CSS reloading
* full page reloading
* protocol, WebSocket communication
* CSS @import support
* live image reloading (IMG src, background-image and border-image properties, both inline and in stylesheets)
* live in-browser LESS.js reloading

To Do:

* live JS reloading


Issues & Limitations
--------------------

**Live reloading of imported stylesheets has a 200ms lag.** Modifying a CSS `@import` rule to reference a not-yet-cached file causes WebKit to lose all document styles, so we have to apply a workaround that causes a lag.

Our workaround is to add a temporary LINK element for the imported stylesheet we're trying to reload, wait 200ms to make sure WebKit loads the new file, then remove the LINK tag and recreate the @import rule. This prevents a flash of unstyled content. (We also wait 200 more milliseconds and recreate the @import rule again, in case those initial 200ms were not enough.)

**Live image reloading is limited to IMG src, background-image and border-image styles.** Any other places where images can be mentioned?

**Live image reloading is limited to jpg, jpeg, gif and png extensions.** Maybe need to add SVG there? Anything else?


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

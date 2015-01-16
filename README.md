LiveReload.js
=============

What is LiveReload?
-------------------

LiveReload is a tool for web developers and designers. See [livereload.com](http://livereload.com/) for more info.

To use LiveReload, you need a client (this script) in your browser and a server running on your development machine.

This repository (livereload.js) implements the client side of the protocol. The client connects to a LiveReload server via web sockets and listens for incoming change notifications. When a CSS or an image file is modified, it is live-refreshed without reloading the page. When any other file is modified, the page is reloaded.

The server notifies the client whenever a change is made. Available servers are:

* [LiveReload app for Mac](http://livereload.com/)
* [rack-livereload](https://github.com/johnbintz/rack-livereload)
* [guard-livereload](https://github.com/guard/guard-livereload)
* [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch)
* more available on Google :-)
* you can even write your own, refer to the [LiveReload protocol](http://help.livereload.com/kb/ecosystem/livereload-protocol)

If you are a web developer looking to _use_ LiveReload, you should refer to your LiveReload server/app/tool's documentation rather that this repository. **You should use the copy of livereload.js script bundled with your server**, because it's guaranteed to be compatible, and may be customized for that server.

Most LiveReload server vendors will serve livereload.js on the LiveReload port, i.e. in most cases, if you have a server running, you can access the script at `http://0.0.0.0:35729/livereload.js`.

Please read on only if you are:

* using a server that doesn't document the usage of livereload.js
* interested in hacking on livereload.js or want to understand it better
* developing a LiveReload server


What is livereload.js?
----------------------

This repository contains a JavaScript file implementing the client side of the LiveReload protocol. It gets change notifications from a LiveReload server and applies them to the browser.

If you are **developing** a LiveReload server, see [dist/livereload.js](https://github.com/livereload/livereload-js/raw/master/dist/livereload.js) for the latest version built using the sources in this repository. We require LiveReload server vendors to distribute livereload.js as part of their apps/tools.

An old version of this script is also bundled with the LiveReload browser extensions, but it's not getting updated and only serves for compatibility with very old clients. 

Features:

* live CSS reloading
* full page reloading
* protocol, WebSocket communication
* CSS `@import` support
* live image reloading (`<img src="..." />`, `background-image` and `border-image` properties, both inline and in stylesheets)
* live in-browser LESS.js reloading

Would love, but doesn't seem possible:

* live JS reloading


Using livereload.js
-------------------

This script is meant to be included into the web pages you want to monitor, like this:

    <script src="http://localhost:35729/livereload.js"></script>

LiveReload 2 server listens on port 35729 and serves livereload.js over HTTP (besides speaking the web socket protocol on the same port).

A slightly smarter way is to use the host name of the current page, assuming that it is being served from the same computer. This approach enables LiveReload when viewing the web page from other devices on the network:

```html
<script>document.write('<script src="http://'
    + location.host.split(':')[0]
    + ':35729/livereload.js"></'
    + 'script>')</script>
```


However, `location.host` is empty for file: URLs, so we need to account for that:

```html
<script>document.write('<script src="http://'
    + (location.host || 'localhost').split(':')[0]
    + ':35729/livereload.js"></'
    + 'script>')</script>
```


LiveReload.js finds a script tag that includes `.../livereload.js` and uses it to determine the hostname/port to connect to. It also understands some options from the query string: `host`, `port`, `snipver`, `mindelay` and `maxdelay`.

`snipver` specifies a version of the snippet, so that we can warn when the snippet needs to be updated. The currently recommended version 1 of the snippet is:

```html
<script>document.write('<script src="http://'
    + (location.host || 'localhost').split(':')[0]
    + ':35729/livereload.js?snipver=1"></'
    + 'script>')</script>
```


Additionally, you might want to specify `mindelay` and `maxdelay`, which is minimum and maximum reconnection delay in milliseconds (defaulting to 1000 and 60000).

Alternatively, instead of loading livereload.js from the LiveReload server, you might want to include it from a different URL. In this case include a `host` parameter to override the host name. For example:

```html
<script src="https://github.com/livereload/livereload-js/raw/master/dist/livereload.js?host=localhost"></script>
```


Issues & Limitations
--------------------

**Live reloading of imported stylesheets has a 200ms lag.** Modifying a CSS `@import` rule to reference a not-yet-cached file causes WebKit to lose all document styles, so we have to apply a workaround that causes a lag.

Our workaround is to add a temporary `<link />` element for the imported stylesheet we're trying to reload, wait 200ms to make sure WebKit loads the new file, then remove `<link />` and recreate the `@import` rule. This prevents a flash of unstyled content. (We also wait 200 more milliseconds and recreate the `@import` rule again, in case those initial 200ms were not enough.)

**Live image reloading is limited to `<img src="..." />`, `background-image` and `border-image` styles.** Any other places where images can be mentioned?

**Live image reloading is limited to `jpg`, `jpeg`, `gif`, and `png` extensions.** Maybe need to add `svg` there? Anything else?


Communicating with livereload.js
--------------------------------

It is possible to communicate with a running LiveReload script using DOM events:

* fire LiveReloadShutDown event on `document` to make LiveReload disconnect and go away
* listen for LiveReloadConnect event on `document` to learn when the connection is established
* listen for LiveReloadDisconnect event on `document` to learn when the connection is interrupted (or fails to be established)

LiveReload object is also exposed as `window.LiveReload`, with `LiveReload.disconnect()`, `LiveReload.connect()` and `LiveReload.shutDown()` being available. However I'm not yet sure if I want to keep this API, so consider it non-contractual (and email me if you have a use for it).


Having trouble?
---------------

To enable debugging output to console, append `?LR-verbose` to your URL.


Hacking on LiveReload.js
------------------------

Requirements

* Node.js with npm
* Grunt (`npm install grunt-cli`)

To install additional prerequisites:

    npm install

To build:

    grunt build

To run tests:

    grunt


Releasing a new version
-----------------------

1. Update the version number in `package.json`.

1. Run `rake version` to update the version numbers in all other files, using the one from package.json.

1. Run `grunt`.

1. Do some manual testing.

1. Tag the version in Git: `rake tag` then `git push --tags`.

1. `npm publish`


License
-------

livereload-js is available under the MIT license, see LICENSE file for details.

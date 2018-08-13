# Address book

Local for browser address book.

## Running

In order to see the app, one has to run http server of owns choice in the main folder.

There are 3 index files:

* `index.html`: compiled to ES5 and minified (also CSS)
* `index-raw.html`: ES6+ native modules and not minified CSS

The last variant doesn’t work on Firefox without setting a flag in `about:config` (`dom.moduleScrips.enabled`). But other two work just fine.

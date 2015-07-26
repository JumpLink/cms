/**
 * Handle markdown files
 *
 * @see https://github.com/evilstreak/markdown-js
 * @see https://github.com/jprichardson/node-fs-extra
 */
var markdown = require( "markdown" );
var fs = require('fs-extra');

/**
 * Parse markdown string to html.
 *
 * @param {string} md_content - Markdown string to parse
 * @param {parseCallback} cb - Callback with error code or result
 * @returns {string} Parsed HTML string
 * @see https://github.com/evilstreak/markdown-js#node
 */
var parse = function (md_content, cb) {
  var html_content = markdown.parse(md_content);
  if(cb) return cb(null, html_content);
  return html_content;
}

/**
 * parseCallback callback
 * @callback parseCallback
 * @param {string|null} error
 * @param {string} parsed HTML string
 */

/**
 * Load markdown from filesystem
 * @param {string} host - The host of the coming request
 * @param {string} filepath - The file path of the file you are looking for
 * @param {object} options - Options for parsing and file source
 * @param {object} [options.toHTML] - If true parse markdown file to HTML
 * @param {object} [options.theme] - If set the asset is loaded from the passed theme
 * @param {object} [options.site] - If set the asset is loaded from the passed sitename
 */
var load = function (host, filepath, options, cb) {

  ThemeService.getAssetsFile(host, filepath, options, function (err, fullpath) {
    fs.readFile(fullpath, 'utf8', function(err, md_content) {
      if (err) return cb(err);
      if(options.toHTML) {
        parse(md_content, cb);
      } else {
        cb(null, md_content);
      }
    });
  });
}

/**
 * Public functions
 */
module.exports = {
  parse: parse,
  load: load
}
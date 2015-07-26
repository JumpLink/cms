/**
 * Service to parse the code and comments to generate documentation in json.
 *
 * @see: https://github.com/tj/dox#programmatic-usage
 * @see: https://github.com/jprichardson/node-fs-extra
 * @see: https://nodejs.org/api/path.html
 * @see: http://adilapapaya.com/docs/highlight.js/#nodejs
 * @see: https://github.com/caolan/async
 */

var dox = require('dox');           // https://github.com/tj/dox#programmatic-usage
var fs = require('fs-extra');       // https://github.com/jprichardson/node-fs-extra
var path = require('path');         // https://nodejs.org/api/path.html
var hljs = require('highlight.js'); // http://adilapapaya.com/docs/highlight.js/#nodejs

/**
 * Highlighting the parsed code.
 *
 * @param jsDocFolderObjs All documentation objects from a javascript files path
 */
var HighlightDocs = function (jsDocFolderObjs, options, callback) {
  // sails.log.debug("[DocsService.HighlightDocs:jsDocFolderObjs]", jsDocFolderObjs, options);

  async.map(jsDocFolderObjs, function(jsDocFileObj, callback) {
    // sails.log.debug("[DocsService.HighlightDocs:jsDocFileObj]", JSON.stringify(jsDocFileObj, null, 2));
    async.map(jsDocFileObj.dox, function(jsDocFuncsObj, callback) {
      // sails.log.debug("[DocsService.HighlightDocs:jsDocFuncsObj]", jsDocFuncsObj);
      if(UtilityService.isDefined(jsDocFuncsObj.code)) {
        if(options.lang) jsDocFuncsObj.highlight = hljs.highlight(options.lang, jsDocFuncsObj.code);
        else jsDocFuncsObj.highlight = hljs.highlight(jsDocFuncsObj.code);
        jsDocFuncsObj.code = jsDocFuncsObj.highlight.value;

        /**
         * WORADOUND for bug: Maximum call stack size exceeded.
         * I think is too thick
         */
        delete jsDocFuncsObj.highlight;
      }
      callback(null, jsDocFuncsObj);
    }, function(err, dox) {
      jsDocFileObj.dox = dox;
      callback(err, jsDocFileObj);
    });


    
  }, callback);

  // callback(null, jsDocFolderObjs);
};

/**
 * Generate the doc from the read JavaScript file
 */
var parseJsFile = function (jsFileObj, callback) {
  // sails.log.debug(jsFileObj);
  var dir = path.relative(__dirname+"/../..", jsFileObj.path);
  var jsDocObj = {
    dox: dox.parseComments(jsFileObj.data),
    dir: dir,
    base: jsFileObj.base,
    ext: jsFileObj.ext,
    name: jsFileObj.name,
  }
  callback(null, jsDocObj);
};

/**
 * Just a simple sort function.
 *
 * @see UtilityService.$filter
 */
var sort = function(available) {
  return UtilityService.$filter('orderBy')(available);
}

/**
 * Read the JavaScript file
 */
var readJSFile = function (jsFile, name, dirname, callback) {
  // sails.log.debug("[DocsService:readJSFile]",jsFile);
  var filePath = path.join(dirname, jsFile);
  var parsed = path.parse(filePath);
  fs.readFile(filePath, {encoding: 'utf-8'}, function (err, jsData) {
    callback(err, {
      path: filePath,
      dir: parsed.dir,
      base: parsed.base,
      ext: parsed.ext,
      name: parsed.name,
      data: jsData
    });
  });
};

/**
 * Like readJSFile but first param is an array of files.
 */
var readJSFiles = function (jsFiles, name, dirname, callback) {
  async.map(jsFiles, function (jsFile, callback) {
    readJSFile(jsFile, name, dirname, callback);
  }, callback);
};

/**
 * Parse all docs from dirname.
 */
var parseDirname = function (name, dirname, options, callback) {
  async.waterfall([
    function getAllFiles(callback) {
      fs.readdir(dirname, function (err, files) {
        callback(err, files);
      });
    },
    function filterJSFiles(files, callback) {
      async.filter(files, function(file, callback) {
        callback(path.extname(file) === '.js');
      }, function(jsFiles){
        callback(null, jsFiles);
      });
    },
    function (jsFiles, callback) {
      readJSFiles(jsFiles, name, dirname, callback);
    },
    function (jsFileObjs, callback) {
      async.map(jsFileObjs, function (jsFileObj, callback) {
        parseJsFile(jsFileObj, callback);
      }, callback);
    },
    function (jsDocFolderObjs, callback) {
      if(options.highlight) {
        HighlightDocs(jsDocFolderObjs, options, callback);
      } else {
        callback(null, jsDocFolderObjs);
      }
    },
  ], callback);
};

/**
 * Get all available docs sorted by name. 
 */
var available = function () {
  return sort([
    'config',
    'controllers',
    'policies',
    'services',
    'adapters',
    'models',
    'hooks',
    'blueprints',
    'responses',
    'views'
  ]);
};

/**
 * Parse all available docs
 */
var parseAll = function (options, cb) {
  var available = DocsService.available();
  async.mapSeries(available, function (name, cb) {
    var dirname = sails.config.paths[name];
    parseDirname(name, dirname, options, function(err, jsDocObjs){
      cb(err, {docs:jsDocObjs, name: name});
    });
  }, function (err, docsArray) {
    if(err) return cb(err);
    var result = {};
    // convert array to object
    for (var i = 0; i < available.length; i++) {
      result[available[i]] = docsArray[i];
    };
    cb(null, result);
  });
};

/**
 * The following functions are public
 */
module.exports = {
  parseDirname: parseDirname,
  available: available,
  parseAll: parseAll
};

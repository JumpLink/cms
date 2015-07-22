/**
 * 
 */

var dox = require('dox');       // https://github.com/tj/dox#programmatic-usage
var fs = require('fs-extra');   // https://github.com/jprichardson/node-fs-extra
var path = require('path');     // https://nodejs.org/api/path.html
// https://github.com/caolan/async

/**
 * 
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
 * 
 */
var readJSFile = function (jsFile, name, dirname, callback) {
  sails.log.debug("[DocsService:readJSFile]",jsFile);
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
 * 
 */
var readJSFiles = function (jsFiles, name, dirname, callback) {
  async.map(jsFiles, function (jsFile, callback) {
    readJSFile(jsFile, name, dirname, callback);
  }, callback);
};

/**
 * 
 */
var parseDirname = function (name, dirname, callback) {
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
  ], callback);
};

/**
 * 
 */
var available = function () {
  return [
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
  ]
};

/**
 * 
 */
var parseAll = function (cb) {
  var available = DocsService.available();
  async.map(available, function (name, cb) {
    var dirname = sails.config.paths[name];
    parseDirname(name, dirname, function(err, jsDocObjs){
      cb(err, {docs:jsDocObjs, name: name});
    });
  }, cb);
};

/**
 * 
 */
module.exports = {
  parseDirname: parseDirname,
  available: available,
  parseAll: parseAll
};

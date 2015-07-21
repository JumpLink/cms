var dox = require('dox');       // https://github.com/tj/dox#programmatic-usage
var fs = require('fs-extra');   // https://github.com/jprichardson/node-fs-extra
var path = require('path');     // https://nodejs.org/api/path.html
// https://github.com/caolan/async

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
    function readJSFiles(jsFiles, callback) {
      async.map(jsFiles, function (jsFile, callback) {
        var filePath = path.join(dirname, jsFile);
        fs.readFile(filePath, {encoding: 'utf-8'}, function (err, jsData) {
          callback(err, {
            path: filePath,
            dirname: dirname,
            filename: jsFile,
            data:jsData
          });
        });
      }, callback);
    },
    function parseJsFiles(jsFileObjs, callback) {
      async.map(jsFileObjs, function (jsFileObj, callback) {
        var jsDocObj = {
          dox: dox.parseComments(jsFileObj.data),
          path: path.relative(__dirname+"/../..", jsFileObj.path),
          filename: jsFileObj.filename,
          dirname: path.relative(__dirname+"/../..", jsFileObj.dirname),
          name: name
        }
        sails.log.debug(jsDocObj);
        callback(null, jsDocObj);
      }, callback);
    },
  ], callback);
}

var available = function () {
  return [
    'controllers',
    'models',
    'services',
    'responses'
  ]
}

var parseAll = function (cb) {
  var available = DocsService.available();
  async.map(available, function (item, cb) {
    var dirname = sails.config.paths[item];
    DocsService.parseDirname(item, dirname, function (err, jsDocObj) {
      if(err) return cb(err);
      cb(null, jsDocObj);
    });
  }, cb);
}

module.exports = {
  parseDirname: parseDirname,
  available: available,
  parseAll: parseAll
}

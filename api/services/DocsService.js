var dox = require('dox');       // https://github.com/tj/dox#programmatic-usage
var fs = require('fs-extra');   // https://github.com/jprichardson/node-fs-extra
var path = require('path');     // https://nodejs.org/api/path.html
// https://github.com/caolan/async

var parseDirname = function (dirname, callback) {
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
        fs.readFile(path.join(dirname, jsFile), {encoding: 'utf-8'}, callback);
      }, callback);
    },
    function parseJsFiles(jsDatas, callback) {
      async.map(jsDatas, function (jsData, callback) {
        var jsDocObj = dox.parseComments(jsData);
        callback(null, jsDocObj);
        
      }, callback);
    },
  ], callback);
}

module.exports = {
  parseDirname: parseDirname,
}

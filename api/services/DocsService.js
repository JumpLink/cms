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
  async.mapSeries(available, function (name, cb) {
    var dirname = sails.config.paths[name];
    parseDirname(name, dirname, function(err, jsDocObjs){
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
 * Like oarseAll but called docs functions manuelly 
 * @see DocsService.parseAll
 */
var parseAllManually = function (cb) {
  async.waterfall([
    function(callback) {
      var name = 'config';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, {docs:jsDocObjs, name: name});
      });
    },
    function(config, callback) {
      var name = 'controllers';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, callback) {
      var name = 'policies';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, policies, callback) {
      var name = 'services';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, policies, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, policies, services, callback) {
      var name = 'adapters';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, policies, services, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, policies, services, adapters, callback) {
      var name = 'models';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, policies, services, adapters, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, policies, services, adapters, models, callback) {
      var name = 'hooks';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, policies, services, adapters, models, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, policies, services, adapters, models, hooks, callback) {
      var name = 'blueprints';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, policies, services, adapters, models, hooks, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, policies, services, adapters, models, hooks, blueprints, callback) {
      var name = 'responses';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, policies, services, adapters, models, hooks, blueprints, {docs:jsDocObjs, name: name});
      });
    },
    function(config, controllers, policies, services, adapters, models, hooks, blueprints, responses, callback) {
      var name = 'views';
      parseDirname(name, sails.config.paths[name], function(err, jsDocObjs){
        callback(err, config, controllers, policies, services, adapters, models, hooks, blueprints, responses, {docs:jsDocObjs, name: name});
      });
    },
  ], function (err, config, controllers, policies, services, adapters, models, hooks, blueprints, responses, views) {
    cb(err, {
      config: config,
      controllers: controllers,
      policies: policies,
      services: services,
      adapters: adapters,
      models: models,
      hooks: hooks,
      blueprints: blueprints,
      responses: responses,
      views: views
    });
  });
};

/**
 * The following functions are public
 */
module.exports = {
  parseDirname: parseDirname,
  available: available,
  parseAll: parseAll,
  parseAllManually: parseAllManually
};

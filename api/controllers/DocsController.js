/**
 * DocsController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var dox = require('dox');       // https://github.com/tj/dox
var fs = require('fs-extra');   // https://github.com/jprichardson/node-fs-extra
var path = require('path');     // https://nodejs.org/api/path.html

/**
 * Generate docs for all JavaScript files in the config path
 * @param options 
 */
var config = function(req, res) {
  sails.log.debug(sails.config.paths);
  var name = 'config';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/controllers path
 */
var controllers = function(req, res) {
  var name = 'controllers';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * 
 */
var policies = function(req, res) {
  sails.log.debug(sails.config.paths);
  var name = 'policies';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/services path
 */
var services = function(req, res) {
  var name = 'services';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/adapters path
 */
var adapters = function(req, res) {
  var name = 'adapters';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/models path
 */
var models = function(req, res) {
  var name = 'models';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/hooks path
 */
var hooks = function(req, res) {
  var name = 'hooks';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/blueprints path
 */
var blueprints = function(req, res) {
  var name = 'blueprints';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the responses path
 */
var responses = function(req, res) {
  var name = 'responses';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * TODO need a jade / html docs parser?
 */
var views = function(req, res) {
  res.json('TODO');
};

/**
 * Get all available docs
 */
var available = function(req, res) {
  res.json(DocsService.available());
};

/**
 * Get all docs they are list in `available`
 */
var all = function(req, res) {
  sails.log.debug("[DocsController:all]");
  DocsService.parseAll({highlight: true, lang: 'javascript'}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * 
 */
module.exports = {
  config: config,
  controllers: controllers,
  policies: policies,
  services: services,
  adapters: adapters,
  models: models,
  hooks: hooks,
  blueprints: blueprints,
  responses: responses,
  views: views,
  available: available,
  all: all
};
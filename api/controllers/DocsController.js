/**
 * The DocsController is the api to get docs informations as json generated with `dox` 
 *
 * @module DocsController
 *
 * @requires dox - https://github.com/tj/dox
 * @requires path - https://nodejs.org/api/path.html
 * @requires fs-extra - https://github.com/jprichardson/node-fs-extra
 *
 * @see http://sailsjs.org/#!documentation/controllers
 */

var dox = require('dox');
var fs = require('fs-extra');
var path = require('path');

/**
 * Generate docs for all JavaScript files in the config path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var config = function(req, res, next) {
  sails.log.debug(sails.config.paths);
  var name = 'config';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/controllers path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var controllers = function(req, res, next) {
  var name = 'controllers';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * 
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var policies = function(req, res, next) {
  sails.log.debug(sails.config.paths);
  var name = 'policies';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/services path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var services = function(req, res, next) {
  var name = 'services';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/adapters path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var adapters = function(req, res, next) {
  var name = 'adapters';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/models path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var models = function(req, res, next) {
  var name = 'models';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/hooks path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var hooks = function(req, res, next) {
  var name = 'hooks';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the api/blueprints path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var blueprints = function(req, res, next) {
  var name = 'blueprints';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * Generate docs for all JavaScript files in the responses path
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var responses = function(req, res, next) {
  var name = 'responses';
  DocsService.parseDirname(name, sails.config.paths[name], {}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * TODO need a jade / html docs parser?
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var views = function(req, res, next) {
  res.json('TODO');
};

/**
 * Get all available docs
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var available = function(req, res, next) {
  res.json(DocsService.available());
};

/**
 * Get all docs they are list in `available`
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var all = function(req, res, next) {
  sails.log.debug("[DocsController:all]");
  DocsService.parseAll({highlight: true, lang: 'javascript'}, function (err, jsDocObjs) {
    if(err) return res.serverError(err);
    res.json(jsDocObjs);
  });
};

/**
 * public api functions
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
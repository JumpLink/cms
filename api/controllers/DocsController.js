/**
 * DocsController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var dox = require('dox');       // https://github.com/tj/dox#programmatic-usage
var fs = require('fs-extra');   // https://github.com/jprichardson/node-fs-extra
var path = require('path');     // https://nodejs.org/api/path.html
// https://github.com/caolan/async

module.exports = {
  controllers: function(req, res) {
    DocsService.parseDirname('controllers', sails.config.paths.controllers, function (err, jsDocObjs) {
      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },

  models: function(req, res) {
    DocsService.parseDirname('models', sails.config.paths.models, function (err, jsDocObjs) {
      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },

  services: function(req, res) {
    DocsService.parseDirname('services', sails.config.paths.services, function (err, jsDocObjs) {
      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },

  responses: function(req, res) {
    DocsService.parseDirname('responses', sails.config.paths.responses, function (err, jsDocObjs) {
      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },

  available: function(req, res) {
    res.json(DocsService.available());
  },

  all: function(req, res) {
    sails.log.debug("[DocsController:all]");
    DocsService.parseAll(function (err, jsDocObjs) {
      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },
};
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

    DocsService.parseDirname(sails.config.paths.controllers, function (err, jsDocObjs) {

      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },

  models: function(req, res) {
    res.json(sails);
    DocsService.parseDirname(sails.config.paths.models, function (err, jsDocObjs) {

      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },

  services: function(req, res) {
    res.json(sails);
    DocsService.parseDirname(sails.config.paths.services, function (err, jsDocObjs) {

      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },

  responses: function(req, res) {
    res.json(sails);
    DocsService.parseDirname(sails.config.paths.responses, function (err, jsDocObjs) {

      if(err) return res.serverError(err);
      res.json(jsDocObjs);
    });
  },
};
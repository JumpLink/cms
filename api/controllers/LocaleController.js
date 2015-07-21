/**
 * LocaleController
 *
 * @description :: Server-side logic for managing localisation
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/**
 * 
 */
var setup = function(req, res) {
  res.ok();
};

/**
 * 
 */
var get = function(req, res, next) {
  res.ok(req.getLocale());
};

/**
 * 
 */
var catalog = function(req, res, next) {
  var lang = req.param('lang') ? req.param('lang') : req.getLocale();
  var catalog = req.getCatalog(lang);
  res.json(catalog);
};

module.exports = {
  setup:setup,
  get:get,
  catalog:catalog
};


/**
 * TranslationController
 *
 * @description :: Server-side logic for managing translations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  setup: function(req, res) {
    res.ok();
  },

	get: function(req, res, next) {
    res.ok(req.getLocale());
  },
  
  catalog: function(req, res, next) {
    var lang = req.param('lang') ? req.param('lang') : req.getLocale();
    var catalog = req.getCatalog(lang);
    res.json(catalog);
  },
};


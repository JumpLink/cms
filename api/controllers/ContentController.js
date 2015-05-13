/**
 * ContentController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

// var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
  setup: function(req, res) {
    res.ok();
  },

  // warn this creates each time a new id
  replace: function (req, res, next) {

    var query = {
      where: {
        name: req.param('name'),
        site: MultisiteService.getCurrentSiteConfig(req.session.uri.host).name
      }
    };
    // ModelService.updateOrCreateResponse('Content', 'name', req, res, next);
    // ModelService.updateOrCreateQueryResponse('Content', query, req, res, next);
    var data = req.params.all();
    delete data.id;
    if(!data.site) data.site = MultisiteService.getCurrentSiteConfig(req.session.uri.host).name;

    // sails.log.debug("query", query);
    // sails.log.debug("data", data);

    ModelService.updateOrCreate('Content', data, query, function (err, result) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      } else {
        sails.log.info("content "+req.param('name')+" saved");
        res.status(201);
        return res.json(result);
       }
    });

  },



  find: function (req, res) {

    var query = {
      where: {
        name: req.param('name'),
        site: MultisiteService.getCurrentSiteConfig(req.session.uri.host).name
      }
    };

    // sails.log.debug("query", query)

    Content.findOne(query).exec(function found(err, found) {
      if (err) return callback(err);
      if (found instanceof Array) found = found[0];

      // not found
      if (UtilityService.isUndefined(found) || UtilityService.isUndefined(found.id) || found.id === null) {
        res.notFound(query.where);
      } else {
        // sails.log.debug("found", found);
        res.json(found);
      }
    });

  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContentController)
   */
  , _config: {}


};

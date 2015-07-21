/**
 * UserController
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

/**
 * 
 */
var setup = function (req, res, next) {
  SetupService.generateUsers(function(err, result) {
    sails.log.debug("done");
    if(err)
      res.json(err);
    else
      res.json(result);
  });
};

/**
 * 
 */
var update = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var id = req.param('id');
    var data = req.params.all();
    data.site = config.name;
    User.update({id:id},data).exec(function update(error, updated){
      if(error) return res.serverError(error);
      User.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
    });
  });
};

/**
 * 
 */
var destroy = function(req, res) {
  var id = req.param('id');
  User.destroy(id, function (error, destroyed) {
    if(error) return res.serverError(error);
    User.publishDestroy(id);
    sails.log.debug(destroyed);
    res.ok();
  });
};

/**
 * 
 */
var create = function(req, res) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { 
      sails.log.error("[controllers/UserController.js]", err);
      return res.serverError(err);
    }
    var data = req.params.all();
    data.site = config.name;
    User.create(data, function (error, created) {
      if(error) {
        sails.log.error("[controllers/UserController.js]", error);
        return res.serverError(error);
      }
      User.publishCreate(created);
      sails.log.debug(created);
      res.ok();
    });
  });
};

/**
 * 
 */
var find = function (req, res) {
  var query;
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    query = {
      where: {
        site: config.name
      }
    };
    User.find(query).exec(function found(err, found) {
      if (err) return res.serverError(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) {
        res.notFound(query.where);
      } else {
        sails.log.debug("found", found);
        res.json(found);
      }
    });
  });
};

/**
 * 
 */
module.exports = {
  setup:setup,
  update:update,
  destroy:destroy,
  create:create,
  find:find
};

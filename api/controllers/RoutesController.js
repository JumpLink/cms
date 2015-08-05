/**
 *
 * @see http://sailsjs.org/#!documentation/controllers
 */

/**
 * Setup the admin routes for the current site
 *
 * WARN: This function removes all existing routess for site and hust add the default admin routes with the default password.
 */
var setup = function (req, res, next) {
  // get the current site this setup was called
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) return res.serverError(err);
    res.ok();
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
    Routes.update({id:id},data).exec(function update(error, updated){
      if(error) return res.serverError(error);
      Routes.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
    });
  });
};

/**
 * 
 */
var destroy = function(req, res) {
  var id = req.param('id');
  Routes.destroy(id, function (error, destroyed) {
    if(error) return res.serverError(error);
    Routes.publishDestroy(id);
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
      sails.log.error("[RoutesController.create]", err);
      return res.serverError(err);
    }
    var data = req.params.all();
    data.site = config.name;
    Routes.create(data, function (error, created) {
      if(error) {
        sails.log.error("[RoutesController.create]", error);
        return res.serverError(error);
      }
      Routes.publishCreate(created);
      sails.log.debug(created);
      res.ok();
    });
  });
};

/**
 * 
 */
var createByHost = function(req, res) {
  var data = req.params.all();
  var host = data.host;
  delete data.host;
  
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) return res.serverError(err);


    data.site = config.name;
    Routes.create(data, function (error, created) {
      if(error) {
        sails.log.error("[RoutesController.createByHost]", error);
        return res.serverError(error);
      }
      Routes.publishCreate(created);
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
    Routes.find(query).exec(function found(err, found) {
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

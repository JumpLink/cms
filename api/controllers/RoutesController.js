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
  SetupService.generateRoutes(req.session.uri.host, function (err, routes) {
    if(err) return res.serverError(err);
    res.json(routes);
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
var destroy = function(req, res, next) {
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
var create = function(req, res, next) {
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
var createByHost = function(req, res, next) {
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
 * Update or create route (eg. position) for current host.
 */
var updateOrCreate = function (req, res, next) {
  var data = req.params.all();
  sails.log.debug("[RoutesController.updateOrCreate]", data);
  RoutesService.updateOrCreate(req.session.uri.host, data, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreate]", "result", result);
    return res.json(result);
  });
}

/**
 * Update or create route (eg. position) for any passed host.
 * Only for superadmins!
 *
 * @param req.param.host Host to save route for
 */
var updateOrCreateByHost = function (req, res, next) {
  var data = req.params.all();
  var host = data.host;
  delete data.host;
  sails.log.debug("[RoutesController.updateOrCreateByHost]", host, data);
  RoutesService.updateOrCreate(host, data, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreateByHost]", "result", result);
    return res.json(result);
  });
}

/**
 * Update or create each route (eg. position) for current host.
 */
var updateOrCreateEach = function (req, res, next) {
  var data = req.params.all();
  sails.log.debug("[RoutesController.updateOrCreateEach]", data);
  RoutesService.updateOrCreateEach(req.session.uri.host, data.routes, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreateEach]", "result", result);
    return res.json(result);
  });
}

/**
 * Update or create each route (eg. position) for any passed host.
 * Only for superadmins!
 *
 * @param req.param.host Host to save route for
 */
var updateOrCreateEachByHost = function (req, res, next) {
  var data = req.params.all();
  var host = data.host;
  delete data.host;
  sails.log.debug("[RoutesController.updateOrCreateEachByHost]", host, data);
  RoutesService.updateOrCreateEach(host, data.routes, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreateEachByHost]", "result", result);
    return res.json(result);
  });
}

/**
 * 
 */
var find = function (req, res, next) {
  RoutesService.find(req.session.uri.host, {}, function found(err, found) {
    if (err) return res.serverError(err);
    res.json(found);
  });
};

/**
 * 
 */
var findByHost = function (req, res, next) {
  var host = req.param('host');
  RoutesService.find(host, {}, function found(err, found) {
    if (err) return res.serverError(err);
    res.json(found);
  });
};

/**
 * TODO https://support.google.com/webmasters/answer/139066?hl=de
 */
var getCanonicalUrl = function (req, res, next) {

};

/**
 * Public functions
 */
module.exports = {
  setup: setup,
  update: update,
  destroy: destroy,
  create: create,
  updateOrCreate: updateOrCreate,
  updateOrCreateByHost: updateOrCreateByHost,
  updateOrCreateEach: updateOrCreateEach,
  updateOrCreateEachByHost: updateOrCreateEachByHost,
  find: find,
  findByHost: findByHost,
  getCanonicalUrl: getCanonicalUrl
};
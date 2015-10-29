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
 * Export all routes for any host.
 * Only for superadmins!
 */
var exportByHost = function (req, res, next) {
  var host = req.param('host');
  var options = {
    id: true,
    site: true,
  };
  RoutesService.exportByHost(host, options, function (err, routes) {
    if (err) {
      return res.serverError(err);
    }
    res.json(routes);
  });
};

/**
 * Export routes for any host.
 * Only for superadmins!
 */
var importByHost = function (req, res, next) {
  var host = req.param('host');
  req.file("file").upload(function (err, file) {
    if (err) {
      sails.log.error(err);
      return callback(err);
    }
    //...
    data = [];
    options = {};
    RoutesService.importByHost(host, data, options, function (err, result) {
      if(err) { return res.serverError(err); }
      res.json(result);
    });
    return callback(null, result);
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
 * Create a route for any host.
 * Only for superadmins!
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
  var route = data.route;
  sails.log.debug("[RoutesController.updateOrCreate]", data, route);
  RoutesService.updateOrCreate(req.session.uri.host, route, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreate]", "result", result);
    return res.json(result);
  });
};

/**
 * Update or create route for any passed host.
 * If an update or create is needed is checked by ObjectName, Navbar and Sitename.
 * Only for superadmins!
 *
 * @param req.param.host Host to save route for
 */
var updateOrCreateByHostByObjectNameAndNavbar = function (req, res, next) {
  var data = req.params.all();
  var route = data.route;
  var host = data.host;
  delete data.route.importOptions; // delete import info if set
  sails.log.debug("[RoutesController.updateOrCreateByHostByObjectNameAndNavbar]", data, route);
  RoutesService.updateOrCreateByObjectNameAndNavbar(host, route, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreateByHostByObjectNameAndNavbar]", "result", result);
    return res.json(result);
  });
};


/**
 * Update or create route (eg. position) for any passed host.
 * Only for superadmins!
 *
 * @param req.param.host Host to save route for
 */
var updateOrCreateByHost = function (req, res, next) {
  var data = req.params.all();
  var route = data.route;
  var host = data.host;
  sails.log.debug("[RoutesController.updateOrCreateByHost]", host, route, data);
  RoutesService.updateOrCreate(host, route, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreateByHost]", "result", result);
    return res.json(result);
  });
};

/**
 * Update or create each route (eg. position) for current host.
 */
var updateOrCreateEach = function (req, res, next) {
  var data = req.params.all();
  var routes = data.routes;
  sails.log.debug("[RoutesController.updateOrCreateEach]", data, routes);
  RoutesService.updateOrCreateEach(req.session.uri.host, routes, function (err, result) {
    if(err) return res.serverError(err);
    sails.log.debug("[RoutesController.updateOrCreateEach]", "result", result);
    return res.json(result);
  });
};

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
};

/**
 * 
 */
var find = function (req, res, next) {
  var data = req.params.all();
  var where = {};
  sails.log.debug("[RoutesController.find]", data);
  if(UtilityService.isDefined(data.objectName)) {
    where.objectName = data.objectName;
  }
  RoutesService.find(req.session.uri.host, {where:where}, function (err, found) {
    if (err) return res.serverError(err);
    res.json(found);
  });
};

/**
 * 
 */
var findOne = function (req, res, next) {
  var data = req.params.all();
  var where = {};
  sails.log.debug("[RoutesController.find]", data);
  if(UtilityService.isDefined(data.objectName)) {
    where.objectName = data.objectName;
  }
  RoutesService.findOne(req.session.uri.host, {where:where}, function (err, found) {
    if (err) return res.serverError(err);
    res.json(found);
  });
};

/**
 * Only for superadmins
 */
var findByHost = function (req, res, next) {
  var host = req.param('host');
  RoutesService.find(host, {}, function (err, found) {
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
  exportByHost: exportByHost,
  create: create,
  updateOrCreate: updateOrCreate,
  updateOrCreateByHostByObjectNameAndNavbar: updateOrCreateByHostByObjectNameAndNavbar,
  updateOrCreateByHost: updateOrCreateByHost,
  updateOrCreateEach: updateOrCreateEach,
  updateOrCreateEachByHost: updateOrCreateEachByHost,
  find: find,
  findOne: findOne,
  findByHost: findByHost,
  getCanonicalUrl: getCanonicalUrl
};

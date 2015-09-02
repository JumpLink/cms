/**
 * 
 */

/**
 * 
 */
var updateOrCreate = function(host, route, cb) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) cb(err);
    route.site = config.name;
    // modelName, data, query, callback, extendFound
    ModelService.updateOrCreate('Routes', route, {id: route.id, site: route.site}, cb);
  });
}

/**
 * 
 */
var updateOrCreateEach = function(host, routes, cb) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) cb(err);
    for (var i = routes.length - 1; i >= 0; i--) {
      routes[i].site = config.name;
    };
    // modelName, datas, propertyNames, callback, extendFound
    ModelService.updateOrCreateEach('Routes', routes, ['id', 'site'], cb);
  });
}

/**
 * 
 */
var find = function (host, query, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { return callback(err); }
    if(UtilityService.isUndefined(query)) query = {};
    if(UtilityService.isUndefined(query.where)) query.where = {};
    if(UtilityService.isUndefined(query.where.site)) query.where.site = config.name;

    Routes.find(query).exec(function (err, found) {
      if (err) return callback(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) return callback("not found");
      callback(null, found);
    });
  });
};

/**
 * 
 */
var findOne = function (host, query, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { return callback(err); }
    if(UtilityService.isUndefined(query)) query = {};
    if(UtilityService.isUndefined(query.where)) query.where = {};
    if(UtilityService.isUndefined(query.where.site)) query.where.site = config.name;

    Routes.findOne(query).exec(function (err, found) {
      if (err) return callback(err);
      // not found
      if (UtilityService.isUndefined(found)) return callback("not found");
      callback(null, found);
    });
  });
};

/**
 * 
 */
var findOneByFallbackUrl = function (host, url, callback) {
  // sails.log.debug("[RoutesService.findOneByFallbackUrl]", "host", host, "url", url);
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { return callback(err); }
    var site = config.name;
    Routes.find({site:site}).exec(function (err, routes) {
      if (err) return callback(err);
      if (!UtilityService.isArray(routes)) return callback("not found");
      var found = false;
      var route = null;
      for (var i = routes.length - 1; i >= 0 && !found; i--) {
        if(UtilityService.isDefined(routes[i]) && UtilityService.isDefined(routes[i].fallback) && routes[i].fallback.url === url){
          found = true;
          route = routes[i];
        }
      };
      if(found) return callback(null, route);
      return callback("not found");
    });
  });
};

/**
 * Check if route is a modern or fallback route.
 * cb(err, isModern, route);
 */
var isModern = function(host, url, cb) {
  find(host, {}, function found(err, result) {
    if (err) return cb(err);
    var found = false;
    for (var i = result.length - 1; i >= 0 && !found; i--) {
      if(result[i].url === url) {
        sails.log.debug("[ThemeController.check] Modern route found!");
        found = true;
        return cb(null, true, result[i]);
      }
      if(result[i].fallback.url === url) {
        sails.log.debug("[ThemeController.check] Fallback route found! TODO");
        found = true;
        return cb(null, false, result[i]);
      }
    };
    sails.log.warn("[ThemeController.check] Route not found!", url);
    if(!found) return cb("not found");
  });
};


/**
 * Public functions
 */
module.exports = {
  updateOrCreate: updateOrCreate,
  updateOrCreateEach: updateOrCreateEach,
  find: find,
  findOne: findOne,
  findOneByFallbackUrl: findOneByFallbackUrl,
  isModern: isModern
}

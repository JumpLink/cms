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

    Routes.find(query).exec(function found(err, found) {
      if (err) return callback(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) return callback("not found");
      callback(null, found);
    });
  });
};

/**
 * Public functions
 */
module.exports = {
  updateOrCreate: updateOrCreate,
  updateOrCreateEach: updateOrCreateEach,
  find: find
}

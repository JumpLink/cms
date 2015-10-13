/**
 * 
 */
var find = function (host, query, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { return callback(err); }
    if(UtilityService.isUndefined(query)) query = {};
    if(UtilityService.isUndefined(query.where)) query.where = {};
    if(UtilityService.isUndefined(query.where.site)) query.where.site = config.name;

    User.find(query).exec(function (err, found) {
      if (err) return callback(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) return callback("not found");
      callback(null, found, config);
    });
  });
};

/**
 * 
 */
var updateOrCreate = function(host, user, callback) {
  sails.log.debug("[UserService.updateOrCreate]", host, user);
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) callback(err);
    user.site = config.name;
    // modelName, data, query, callback, extendFound
    ModelService.updateOrCreate('User', user, {id: user.id, site: user.site}, callback);
  });
}

/**
 * Public functions
 */
module.exports = {
  find: find,
  updateOrCreate: updateOrCreate,
}

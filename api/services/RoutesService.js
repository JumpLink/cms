/**
 * 
 */
var sm = require('sitemap');
var async = require('async');

/**
 * 
 */
var updateOrCreate = function(host, route, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) callback(err);
    route.site = config.name;
    // modelName, data, query, callback, extendFound
    ModelService.updateOrCreate('Routes', route, {id: route.id, site: route.site}, callback);
  });
};

/**
 * 
 */
var updateOrCreateEach = function(host, routes, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) callback(err);
    for (var i = routes.length - 1; i >= 0; i--) {
      routes[i].site = config.name;
    }
    // modelName, datas, propertyNames, callback, extendFound
    ModelService.updateOrCreateEach('Routes', routes, ['id', 'site'], callback);
  });
};

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
      callback(null, found, config);
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
      callback(null, found, config);
    });
  });
};

/**
 * 
 */
var findOneByFallbackUrl = function (host, url, callback) {
  sails.log.debug("[RoutesService.findOneByFallbackUrl]", "host", host, "url", url);
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
      }
      if(found) return callback(null, route, config);
      return callback("not found");
    });
  });
};

/**
 * Find Route and check if route is a modern or fallback route.
 * callback(err, isModern, route);
 */
var findOneByUrl = function(host, url, callback) {
  sails.log.debug("[ThemeController.findOneByUrl]", host, url);
  find(host, {}, function (err, result) {
    if (err) return callback(err);
    var found = false;
    for (var i = result.length - 1; i >= 0 && !found; i--) {
      // modern url
      if(result[i].url === url) {
        sails.log.debug("[ThemeController.findOneByUrl] Modern route found!", url, result[i].url);
        found = true;
        return callback(null, true, result[i]);
      }
      if(UtilityService.isDefined(result[i].alternativeUrls)) {
        for (var k = result[i].alternativeUrls.length - 1; k >= 0 && !found; k--) {
          if(result[i].alternativeUrls[k] === url) {
            sails.log.debug("[ThemeController.findOneByUrl] Alternative modern route found!", url, result[i].url);
            found = true;
            return callback(null, true, result[i]);
          }
        }
      }
    }
    sails.log.warn("[RoutesService.findOneByUrl] Route not found!", url);
    if(!found) return callback("not found");
  });
};

/**
 * Find Route by state name
 * callback(err, route);
 */
var findOneByStateName = function(host, stateName, callback) {
  sails.log.debug("[ThemeController.findOneByStateName]", host, stateName);
  return find(host, {}, function (err, result) {
    if (err) {
      if(UtilityService.isFunction(callback)) {
        return callback(err);
      }
      return err;
    }
    var found = false;
    for (var i = result.length - 1; i >= 0 && !found; i--) {
      if(UtilityService.isDefined(result[i].state) && UtilityService.isDefined(result[i].state.name) && result[i].state.name === stateName) {
        sails.log.debug("[ThemeController.findOneByStateName] Route found!", stateName, result[i].state.name);
        found = true;
        if(UtilityService.isFunction(callback)) {
          return callback(null, result[i]);
        }
        return result[i];
      }
    }
    sails.log.warn("[RoutesService.findOneByStateName] Route not found!", stateName);
    if(!found) {
      if(UtilityService.isFunction(callback)) {
        return callback("Route with statename '"+stateName+"'not found!");
      }
      return "Route with statename '"+stateName+"'not found!";
    }
  });
};

/**
 *
 * @see https://github.com/ekalinin/sitemap.js
 */
var getSitemapUrls = function (host, callback) {
  find(host, {}, function(err, routes) {
    if(err) return callback(err);
    var sitemapUrls = [];
    for (var i = 0; i < routes.length; i++) {
      
      var mainUrl = {
        changefreq: 'monthly',
        priority: 0.1,
        lang: 'de'
      };

      // overwrite default values
      if(UtilityService.isDefined(routes[i].url)) mainUrl.url = routes[i].url;
      if(UtilityService.isDefined(routes[i].changefreq)) mainUrl.changefreq = routes[i].changefreq;
      if(UtilityService.isDefined(routes[i].priority)) mainUrl.priority = routes[i].priority;
      if(UtilityService.isDefined(routes[i].lang)) mainUrl.lang = routes[i].lang;

      sitemapUrls.push(mainUrl);

      // add alternative urls TODO nur beforzugte urls und keine fallback urls?
      // if(UtilityService.isDefined(routes[i].alternativeUrls)) {
      //   for (var k = 0; k < routes[i].alternativeUrls.length; k++) {
      //     routes[i].alternativeUrls[k]
      //   };
      // }
    }
    callback(err, sitemapUrls);
  });
};

/**
 * Generate sitemap.xml
 * @see https://github.com/ekalinin/sitemap.js
 */
var generateSitemap = function (protocol, host, callback) {
  var sitemapOptions = {};
  async.parallel({
    config: function(callback){
      MultisiteService.getCurrentSiteConfig(host, callback);
    },
    urls: function(callback){
      getSitemapUrls(host, callback);
    }
  },
  function(err, results) {
    if(err) return callback(err);
    sitemapOptions.hostname = protocol + "://"+host; // TODO
    sitemapOptions.cacheTime = 600000;  // 600 sec cache period
    sitemapOptions.urls = results.urls;
    sails.log.debug("[RoutesService.generateSitemap]", results, sitemapOptions);
    var sitemap = sm.createSitemap(sitemapOptions);
    sitemap.toXML(callback);
  });
};

/**
 * Public functions
 */
module.exports = {
  updateOrCreate: updateOrCreate,
  updateOrCreateEach: updateOrCreateEach,
  find: find,
  findALL: find, // Alias
  findOne: findOne,
  findOneByFallbackUrl: findOneByFallbackUrl,
  findOneByUrl: findOneByUrl,
  isModern: findOneByUrl, // Alias
  findOneByStateName: findOneByStateName,
  generateSitemap: generateSitemap,
};

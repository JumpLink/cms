/**
 * @see http://sailsjs.org/#!documentation/controllers
 */
var path = require("path");

/**
 * Get a list of found Themes 
 */
var available = function (req, res, next) {
  ThemeService.getAvailableThemes(function (dirs) {
    // sails.log.debug(dirs);
    res.json(dirs);
  });
}

/**
 * 
 */
var infos = function (req, res, next) {
  ThemeService.getThemesSortedByPriority(req.session.uri.host, function (err, themes) {
    if(err) return res.serverError(err);
    res.json(themes);
  });
}

/**
 * find themes for current host from database and isert priority from database (or from local.json if no priority is set).
 */
var find = function (req, res, next) {
  ThemeService.getThemesSortedByPriority(req.session.uri.host, function (err, themes) {
    if(err) return res.serverError(err);
    return res.json({available: themes});
  });
}

/**
 * find themes for any passed host from database and isert priority from database (or from local.json if no priority is set).
 * Only for superadmins!
 */
var findByHost = function (req, res, next) {
  var host = req.param('host');
  // sails.log.debug("[ThemeController.findByHost]", host);
  ThemeService.getThemesSortedByPriority(host, function (err, themes) {
    if(err) return res.serverError(err);
    return res.json({available: themes});
  });
}


/**
 * Update or create theme (eg. priority) for current host.
 */
var updateOrCreate = function (req, res, next) {
  var data = req.params.all();
  // sails.log.debug(data);
  ThemeService.updateOrCreate(req.session.uri.host, data, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

/**
 * Update or create theme (eg. priority) for any passed host.
 * Only for superadmins!
 *
 * @param req.param.host Host to save theme for
 */
var updateOrCreateByHost = function (req, res, next) {
  var data = req.params.all();
  var host = data.host;
  delete data.host;
  // sails.log.debug(data);
  ThemeService.updateOrCreate(host, data, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

/**
 * Update or create each theme (eg. priority) for current host.
 */
var updateOrCreateEach = function (req, res, next) {
  var data = req.params.all();
  // sails.log.debug(data);
  ThemeService.updateOrCreateEach(req.session.uri.host, data.themes, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

/**
 * Update or create each theme (eg. priority) for any passed host.
 * Only for superadmins!
 *
 * @param req.param.host Host to save theme for
 */
var updateOrCreateEachByHost = function (req, res, next) {
  var data = req.params.all();
  var host = data.host;
  delete data.host;
  // sails.log.debug(data);
  ThemeService.updateOrCreateEach(host, data.themes, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

/**
 * 
 */
var fallback = function (req, res, next, force, route) {
  var host = req.session.uri.host;
  var url = req.path;

  if(UtilityService.isUndefined(force)) {
    force = getForce(req);
  }

  sails.log.info("[ThemeController.fallback]", host, url, force, route);

  var _fallback = function (req, res, next, force, route) {
    ThemeService.getController(req.session.uri.host, 'FallbackController', function (err, FallbackController) {
      if(err) return res.serverError(err);
      else return FallbackController.fallback(req, res, next, force, route);
    });
  }

  if(UtilityService.isUndefined(route)) {
    sails.log.warn("[ThemeController.fallback] route is not defined!")
    return RoutesService.findOneByUrl(host, url, function(err, isModern, route) {
      sails.log.warn("[ThemeController.fallback]", "url", url, "host", host, "route:", route);
      return _fallback(req, res, next, force, route);
    });
  } else {
    return _fallback(req, res, next, force, route);
  }

}

/**
 * 
 */
var signin = function (req, res, next, force) {
  ThemeService.getController(req.session.uri.host, 'FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.signin(req, res, next, force);
  });
}

/**
 * 
 */
var updateBrowser = function (req, res, next, force) {
  ThemeService.getController(req.session.uri.host, 'FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.updateBrowser(req, res, next, force);
  });
}

/**
 * 
 */
var modern = function(req, res, next, force, route) {
  var user = null;
  var url = req.path;
  var host = req.session.uri.host;
  var authenticated = req.session.authenticated === true;
  var filepath = null;
  var site = null;
  if(route && route.url) url = route.url;
  if(typeof req.session.user != 'undefined') user = req.session.user;

  var _modern = function (req, res, next, force, route) {
    if(route && route.url) url = route.url;
    // 
    return ThemeService.getThemeWithHighestPriority(host, function(err, currentTheme) {
      if(err) return res.serverError(err);
      filepath = currentTheme.modernview;
      MultisiteService.getCurrentSiteConfig(host, function (err, config) {
        if(err) return res.serverError(err);
        site = config.name;
        if(err) return res.serverError(err);
        RoutesService.find(host, {}, function(err, routes) {
          // routes = JSON.stringify(routes);
          // sails.log.debug("[ThemeController.modern]", routes);
          return ThemeService.view(host, filepath, res, {force: force, url: url, authenticated: authenticated, user: user, site: site, config: {paths: sails.config.paths, environment: sails.config.environment}, routes: routes});
        });
      });
    });
  }

  if(UtilityService.isUndefined(route)) {
    sails.log.warn("[ThemeController.modern] route is not defined!")
    return RoutesService.findOne(host, {url: url}, function(err, route) {
      return _modern(req, res, next, force, route);
    });
  } else {
    return _modern(req, res, next, force, route);
  }
};

var getForce = function (req, cb) {
  var force = null;
  if(req.param('force')) {
    force = req.param('force');
  }
  if(req.query.force) {
    force = req.query.force;
  }
  if(UtilityService.isFunction(cb)) return cb(null, force);
  return force;
}

/**
 * Check if modern or fallback mode is forced with url parameters
 * cb(err, isForce, isModern)
 * TODO move to new service?
 */
var force = function (req, cb) {
  var force = getForce(req);
  var isForce = false;
  if(force != null) isForce = true;
  var isModern = null;
  var error = null;
  if(isForce) isModern = (force == 'modern' && (force != 'fallback' && force != 'legacy' && force != 'noscript'));
   sails.log.debug("[ThemeController.force] error", error, "isForce", isForce, "isModern", isModern, "force", force);
  if(UtilityService.isFunction(cb)) return cb(error, isForce, isModern, force);
  return isForce;
}

/**
 * View html or jade file from Theme / Site
 *
 * @param {Object} req - The request object
 * @param {Object} req.param.theme - Force Theme to view
 * @param {Object} req.param.site - Force Site to view
 * @param {Object} res - The response object
 */
var view = function(req, res, next) {
  var options = {};
  var locals = {}; //TODO
  var filepath = req.path;
  if(req.param('theme'))
    options.theme = req.param('theme');
  if(req.param('site'))
    options.site = req.param('site');
  // sails.log.debug("[ThemeController.view]", req.session.uri.host, filepath, locals, options);
  return ThemeService.view(req.session.uri.host, filepath, res, locals, options);
};

/**
 * Loads asset files dynamically.
 * Function searchs file in site in current site folder,
 * if no file was found, looks file in theme with the heigest priority.
 * Otherwise it will be loaded from theme with lower piority and so on..
 * If no priority is set, the fallback theme defined in local.json has the highest priority "1".
 *
 * @param {Object} req - The request object
 * @param {string} [req.theme] - If set the asset is loaded from the passed theme
 * @see ThemeService.getFile
 */
var assets = function (req, res, next, filepath) {
  var filepath = decodeURIComponent(filepath || req.path);
  var theme = req.param('theme');
  var force_site = req.param('force-site');
  ThemeService.getFile(req.session.uri.host, filepath, {theme:theme, site:force_site}, function (err, fullpath) {
    if(err) return res.serverError(err);
    return res.sendfile(fullpath);
  });
}

/**
 * Converts robots.txt to /assets/robots.txt so you can put it in your theme folder.
 */
var likeAssets = function (req, res, next) {
  assets(req, res, next, path.join('/assets', req.path));
}

/**
 * Converts /favicon.ico to /assets/favicons/favicon.ico so you can put it in your theme folder.
 */
var favicon = function (req, res, next) {
  assets(req, res, next, path.join('/assets/favicons', req.path));
}

/**
 * TODO
 * @see https://support.google.com/webmasters/answer/139066?hl=de
 * @see https://de.wikipedia.org/wiki/Sitemap
 */
var sitemap = function (req, res, next) {
  var url = req.path;
  var protocol = req.protocol;
  var host = req.session.uri.host;
  RoutesService.generateSitemap(protocol, host, function (err, sitemapXml) {
    if(err) return next(err);
    sails.log.debug("[ThemeController.sitemap]", sitemapXml.toString());
    return res.xml(sitemapXml);
  });
}

/**
 * TODO
 * @see https://de.wikipedia.org/wiki/Robots_Exclusion_Standard
 */
var robots = function () {

}

/**
 * Check if
 * * URL is forced with force paramr
 * and render modern or fallback view
 */
var dynamicForced = function(req, res, next, route) {
  // Check if modem or fallback mode is forced
  force(req, function (err, isForce, isModernForce, forceParam) {
    if(err) return next(err);
    if(isForce) {
      if(isModernForce) return modern(req, res, next, forceParam, route);
      return fallback(req, res, next, forceParam, route);
    }
    next(); // next step if url is not forced
  });
};

/**
 * Check if
 * * URL is forced with force param
 * * modern view is supported by Browser
 * and render modern or fallback view
 * Use this if you know the route is modern
 */
var dynamicSupported = function(req, res, next, route) {
  // Check if modem or fallback mode is forced
  force(req, function (err, isForce, isModernForce, forceParam) {
    if(err) return next(err);
    if(isForce) {
      if(isModernForce) return modern(req, res, next, forceParam, route);
      return fallback(req, res, next, forceParam, route);
    }
    // if url is not force check if browser is supported
    var isSupported = UseragentService.supported(req);
    // if'browser is supported call modern view
    if(isSupported) return modern(req, res, next, forceParam, route);
    // orherwise show the fallback view
    return fallback(req, res, next, forceParam, route);
  }, route);
};

/**
 * Check if
 * * Route is modern or fallback
 * * URL is forced with force param
 * * modern view is supported by Browser
 * and render modern or fallback view
 */
var dynamicRoute = function(req, res, next) {

  var url = req.path;
  var host = req.session.uri.host;

  if(UtilityService.isUndefined(url)) return next();

  sails.log.debug("check", url, host);
  // Çheck url for modern or fallback
  RoutesService.findOneByUrl(host, url, function found(err, isModern, route) {
    if (err) {
      if(err === "not found") return next(); // if not found go back to config/routes.js and try the next
      return next(err);
    }
    // if route is found and modern, check if browser is supported
    if(isModern) return dynamicSupported(req, res, next, route); 
    // if route is not modern use fallback
    return fallback(req, res, next, forceParam, route);
  });
};

/**
 * Public functions of ThemeController
 */
module.exports = {
  available: available
  , infos: infos
  , find: find
  , findByHost: findByHost
  , updateOrCreate: updateOrCreate
  , updateOrCreateByHost: updateOrCreateByHost
  , updateOrCreateEach: updateOrCreateEach
  , updateOrCreateEachByHost: updateOrCreateEachByHost
  , fallback: fallback
  , signin: signin
  , updateBrowser: updateBrowser
  , modern: modern
  , view: view
  , assets: assets
  , likeAssets: likeAssets
  , favicon: favicon
  , sitemap: sitemap
  , force: force
  , dynamicForced: dynamicForced
  , dynamicSupported: dynamicSupported
  , dynamicRoute: dynamicRoute
};

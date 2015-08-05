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
  sails.log.debug("[ThemeController.findByHost]", host);
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
  // sails.log.debug(data);
  ThemeService.updateOrCreate(data.host, data, function (err, result) {
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
  // sails.log.debug(data);
  ThemeService.updateOrCreateEach(data.host, data.themes, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

/**
 * 
 */
var fallback = function (req, res, next, force) {
  ThemeService.getController(req.session.uri.host, 'FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.fallback(req, res, next, force);
  });
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
var modern = function(req, res, next) {

  var ok = function (req, res, next, force) {

    // sails.log.info(req.session);
    // TODO fix user
    var user = "{}";
    if(typeof req.session.user != 'undefined') user = JSON.stringify(req.session.user);
    
    return ThemeService.getThemeWithHighestPriority(req.session.uri.host, function(err, currentTheme) {
      if(err) return res.serverError(err);
      var filepath = currentTheme.modernview;
      MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
        return ThemeService.view(req.session.uri.host, filepath, res, {force: force, url: req.path, authenticated: req.session.authenticated === true, user: user, site: config.name, config: {paths: sails.config.paths, environment: sails.config.environment}});
      });
    });
  }

  var force = null; // modern | legacy

  if(req.param('force'))
    force = req.param('force');

  if(req.query.force)
    force = req.query.force;

  // sails.log.debug('force', force);

  if(UseragentService.isModern(req, force)) {
    return ok (req, res, next, force);
  } else {
    return fallback (req, res, next, force);
  }
};

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

  sails.log.debug("[ThemeController.view]", req.session.uri.host, filepath, locals, options);

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
 * 
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
};

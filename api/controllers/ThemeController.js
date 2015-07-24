/**
 * @docs        :: http://sailsjs.org/#!documentation/controllers
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
  ThemeService.getThemesSortedByPriority(req, function (err, themes) {
    if(err) return res.serverError(err);
    res.json(themes);
  });
}

/**
 * find from database and isert priority from database
 */
var find = function (req, res, next) {
  ThemeService.getThemesSortedByPriority(req, function (err, themes) {
    if(err) return res.serverError(err);
    return res.json({available: themes});
  });
}

/**
 * 
 */
var updateOrCreate = function (req, res, next) {
  var data = req.params.all();
  // sails.log.debug(data);
  ThemeService.updateOrCreate(req, data, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

/**
 * 
 */
var updateOrCreateEach = function (req, res, next) {
  var data = req.params.all();
  // sails.log.debug(data);
  ThemeService.updateOrCreateEach(req, data, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

/**
 * 
 */
var fallback = function (req, res, next, force) {
  ThemeService.getController(req, 'FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.fallback(req, res, next, force);
  });
}

/**
 * 
 */
var signin = function (req, res, next, force) {
  ThemeService.getController(req, 'FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.signin(req, res, next, force);
  });
}

/**
 * 
 */
var updateBrowser = function (req, res, next, force) {
  ThemeService.getController(req, 'FallbackController', function (err, FallbackController) {
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
    
    return ThemeService.getThemeWithHighestPriority(req, function(err, currentTheme) {
      var filepath = currentTheme.modernview;
      MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
        return ThemeService.view(req, filepath, res, {force: force, url: req.path, authenticated: req.session.authenticated === true, user: user, site: config.name, config: {paths: sails.config.paths, environment: sails.config.environment}});
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
 * Loads asset files dynamically
 * First the file will be loaded from the theme with the highest priority,
 * if file was not found, it will be loaded from theme with lower piority and so on..
 * FIXME much javascript files not parsed as application/javascript
 */
var assets = function (req, res, next, filepath) {
  //sails.log.debug(req.path);
  var filepath = decodeURIComponent(filepath || req.path);
  if(req.param('theme')) {
    var rootpath = ThemeService.getRootPathOfThemeDirname(req.param('theme'));
    return res.sendfile(req.path,  {root: rootpath});
  } else {
    ThemeService.getDirnameForAssetspath(req, filepath, function (err, rootpath) {
      if(err || rootpath === null) {
        sails.log.error(err, filepath);
        return res.serverError(err, filepath);
      } else {
        var fullpath = path.join(rootpath, filepath);
        // sails.log.debug("fullpath", fullpath);
        return res.sendfile(fullpath);
      }
    });
  }
}

/**
 * converts robots.txt to /assets/robots.txt so you can put it in your theme folder 
 */
var likeAssets = function (req, res, next) {
  assets(req, res, next, path.join('/assets', req.path));
}

/**
 * converts /favicon.ico to /assets/favicons/favicon.ico so you can put it in your theme folder 
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
  , updateOrCreate: updateOrCreate
  , updateOrCreateEach: updateOrCreateEach
  , fallback: fallback
  , signin: signin
  , updateBrowser: updateBrowser
  , modern: modern
  , assets: assets
  , likeAssets: likeAssets
  , favicon: favicon
};

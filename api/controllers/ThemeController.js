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
var infos = function (req, res, next) {
  ThemeService.getThemesSortedByPriority(function (err, themes) {
    if(err) return res.serverError(err);
    res.json(themes);
  });
}

var find = function (req, res, next) {
  ThemeService.getThemesSortedByPriority(function (err, themes) {
    if(err) return res.serverError(err);
    return res.json({available: themes});
  });
}

var updateOrCreate = function (req, res, next) {
  var data = req.params.all();
  sails.log.debug(data);
  ThemeService.updateOrCreate(data, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

var updateOrCreateEach = function (req, res, next) {
  var data = req.params.all();
  sails.log.debug(data);
  ThemeService.updateOrCreateEach(data, function (err, result) {
    if(err) return res.serverError(err);
    return res.json(result);
  });
}

var fallback = function (req, res, next, force) {
  ThemeService.getController('FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.fallback(req, res, next, force);
  });
}

var signin = function (req, res, next, force) {
  ThemeService.getController('FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.signin(req, res, next, force);
  });
}

var updateBrowser = function (req, res, next, force) {
  ThemeService.getController('FallbackController', function (err, FallbackController) {
    if(err) return res.serverError(err);
    else return FallbackController.updateBrowser(req, res, next, force);
  });
}

var modern = function(req, res, next) {

  var ok = function (req, res, next, force) {
    // TODO fix user
    var user = "{}";
    if(typeof req.session.user != 'undefined') user = JSON.stringify(req.session.user);
    
    return ThemeService.getThemeWithHighestPriority(function(err, currentTheme) {
      var filepath = currentTheme.modernview;
      return ThemeService.view(filepath, res, {force: force, url: req.path, authenticated: req.session.authenticated === true, user: user});
    });
  }

  var force = null; // modern | legacy

  if(req.param('force'))
    force = req.param('force');

  if(req.query.force)
    force = req.query.force;

  sails.log.debug('force', force);

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
var assets = function (req, res, next) {
  //sails.log.debug(req.path);
  var filepath = req.path;
  if(req.param('theme')) {
    var rootpath = ThemeService.getRootPathOfThemeDirname(req.param('theme'));
    return res.sendfile(req.path,  {root: rootpath});
  } else {
    ThemeService.getThemeRootPathForFile(filepath, function (err, rootpath) {
      if(err) {
        sails.log.error(err);
        return res.serverError(err);
      }
      else {
        var fullpath = path.join(rootpath, filepath);
        sails.log.debug("fullpath", fullpath);
        return res.sendfile(fullpath, {root: sails.config.paths.public});
      }
    });
  }
}
 
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
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContentController)
   */
  , _config: {}
};

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
    if(err) return res.error(err);
    res.json(themes);
  });
}

var find = function (req, res, next) {
  ThemeService.getThemesSortedByPriority(function (err, themes) {
    if(err) return res.error(err);
    return res.json({available: themes});
  });
}

var updateOrCreate = function (req, res, next) {
  var data = req.params.all();
  sails.log.debug(data);
  ThemeService.updateOrCreate(data, function (err, result) {
    if(err) return res.error(err);
    return res.json(result);
  });
}

var updateOrCreateEach = function (req, res, next) {
  var data = req.params.all();
  sails.log.debug(data);
  ThemeService.updateOrCreateEach(data, function (err, result) {
    if(err) return res.error(err);
    return res.json(result);
  });
}

// FIXME
var assets = function (req, res, next) {
  sails.log.debug(req.path);
  
  var filepath = req.path.substring(8); // remove '/dynamic'
  
  sails.log.debug(filepath);
  
  if(req.param('theme')) {
    var rootPath = ThemeService.getRootPathOfThemeDirname(req.param('theme'));
    // sails.log.debug("get "+req.path+" from theme "+req.param('theme')+".");
    // sails.log.debug(rootPath);
    return res.sendfile(req.path,  {root: rootPath});
  } else {
    ThemeService.getRootPathOfFile(filepath, function (err, rootpath) {
      if(err) {
        sails.log.error(err);
        return res.error(err);
      }
      else {
        var relativepath = path.join(rootpath, filepath);
        sails.log.debug("relativepath", relativepath);
        return res.sendfile(relativepath, {root: sails.config.paths.public});
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
  , assets: assets
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContentController)
   */
  , _config: {}
};

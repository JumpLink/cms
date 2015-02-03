/**
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
var path = require('path');
var async = require('async');
var THEME_DIR = './views';
var INFO_FILENAME = "theme.json";

var isDefined = function (value) {
 return typeof(value) !== "undefined" && value !== null;
}

var isUndefined = function (value) {
 return !isDefined(value);
}

// http://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
var getDirsSync = function (srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

/**
 * get an array of dirs in path
 */
var getDirs = function(srcpath, cb) {
  fs.readdir(srcpath, function (err, files) {
    if(err) { 
      console.error(err);
      return cb([]);
    }
    var iterator = function (file, cb)  {
      fs.stat(path.join(srcpath, file), function (err, stats) {
        if(err) { 
          console.error(err);
          return cb(false);
        }
        cb(stats.isDirectory());
      })
    }
    async.filter(files, iterator, cb);
  });
}

var getAvailableThemes = function (cb) {
  getDirs(THEME_DIR, function (dirs) {
    var iterator = function (dir, cb)  {
      var themeInfoPath = THEME_DIR+"/"+dir+"/"+INFO_FILENAME;
      fs.exists(themeInfoPath, function(exists) { 
         cb(exists);
      }); 
    }
    async.filter(dirs, iterator, cb);
  });
}

var getThemes = function (cb) {
  getAvailableThemes(function (availableThemes) {
    var iterator = function (theme, cb) {
      var themePath = THEME_DIR+"/"+theme;
      var themeInfoPath = themePath+"/"+INFO_FILENAME;
      fs.readJson(themeInfoPath, function(err, themeInfo) {
        if(err) {cb(err);}
        else {
          // themeInfo.path = path.resolve(themePath);
          themeInfo.path = themePath;
          themeInfo.dirname = theme;
          // themeInfo.info = themeInfoPath;
          themeInfo.info = themeInfoPath;
          cb(err, themeInfo);
        }
      });
    }
    async.map(availableThemes, iterator, cb);
  });
}

module.exports = {

  /**
   * Get a list of found Themes 
   */
  available: function (req, res, next) {
    getAvailableThemes(function (dirs) {
      sails.log.debug(dirs);
      res.json(dirs);
    });
  }
  , infos: function (req, res, next) {
    getThemes(function (err, themes) {
      if(err) sails.log.error(err);
      sails.log.debug(themes);
      res.json(themes);
    });
  }
  
  , settings: function (req, res, next) {
    getThemes(function (err, themes) {
      res.json({available: themes, selected: 'bootstrap'});
    });
    
  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContentController)
   */
  , _config: {}


};

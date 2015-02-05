/**
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
// var async = require('async'); is Global
var THEME_DIR = './views';
var INFO_FILENAME = "theme.json";


var getAvailableThemes = function (cb) {
  UtilityService.getDirs(THEME_DIR, function (dirs) {
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
  getAvailableThemes: getAvailableThemes,
  getThemes: getThemes
};

/**
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
var THEME_DIR = './themes';
var INFO_FILENAME = "theme.json";
var path = require("path");

// Get an array of found theme dirnames
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

// set Priority from Database
var setPriority = function (theme, cb) {
  var query = {'dirname': theme.dirname};
  sails.log.debug('setPriority', query);
  global.Theme.findOne(query).exec(function found(err, found) {
    sails.log.debug('found', found);
    theme.priority = found.priority;
    if(UtilityService.isUndefined(theme.priority)) {
      theme.priority = 0;
    }
    cb(null, theme);
  });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
var sortByPriority = function(themes, inverse) {
  return UtilityService.sortArrayByProperty(themes, 'priority', inverse);
}

// get Theme info from local json file of each found theme
var getThemes = function (cb) {
  getAvailableThemes(function (availableThemes) {
    var iterator = function (theme, cb) {
      var themePath = THEME_DIR+"/"+theme;
      var themeInfoPath = themePath+"/"+INFO_FILENAME;
      fs.readJson(themeInfoPath, function(err, themeInfo) {
        if(err) {return cb(err);}
        // themeInfo.path = themePath;
        themeInfo.dirname = theme;
        // themeInfo.info = themeInfoPath;
        setPriority(themeInfo, function (err, theme) {
          return cb(err, theme);
        });
      });
    }
    async.map(availableThemes, iterator, function (err, result) {
      if(err) return cb(err);
      result = UtilityService.sortArrayByProperty(result, true);
      return  cb(err, result);
    });
  });
}

var updateOrCreate = function(theme, cb) {
  ModelService.updateOrCreate('Theme', theme, {'dirname': theme.dirname}, cb);
}

var updateOrCreateEach = function(themes, cb) {
  ModelService.updateOrCreateEach('Theme', themes, 'dirname', cb);
}

var getRootPathOfThemeDirname = function (dirname, cb) {
 return path.normalize(THEME_DIR+"/"+dirname+"/assets");
}

/**
 * Get root path of file from Theme.
 * If file was not found in theme with the highest priority,
 * the file with a lower priority will be used instead,
 * and so on..
 */
var getRootPathOfFile = function (filepath, cb) {
  
  getThemes(function (err, themes) {
    sails.log.debug("getRootPathOfFile", themes);
    for (var i = themes.length; i--; ) {
      var theme = themes[i];
      var rootPath = getRootPathOfThemeDirname(theme.dirname);
      fs.exists(rootPath+'/'+filepath, function(exists) { 
        if (exists) { 
          //sails.log.debug("file FOUND", rootPath, filepath);
          return cb(null, rootPath);
        } else {
          //sails.log.debug("file NOT found", rootPath, filepath);
          if(i <= 0) {
            //sails.log.debug("file not found in any theme", sails.config.paths.public, filepath);
            // return cb(null, sails.config.paths.public);
            return cb(null, '.');
          }
        }
      });
    }
  })
}

    // path.exists('foo.txt', function(exists) { 
    //   if (exists) { 
        // do something 
    //   } 
    // });

module.exports = {
  getAvailableThemes: getAvailableThemes
  , getThemes: getThemes
  , updateOrCreate: updateOrCreate
  , updateOrCreateEach: updateOrCreateEach
  , getRootPathOfFile: getRootPathOfFile
  , getRootPathOfThemeDirname: getRootPathOfThemeDirname
};

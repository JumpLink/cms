/**
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
var path = require("path");
var THEME_DIR = path.resolve(sails.config.paths.public, 'themes');
sails.log.debug("path.resolve(sails.config.paths", sails.config.paths);
var INFO_FILENAME = "theme.json";

// Get an array of found theme dirnames
var getAvailableThemes = function (cb) {
  UtilityService.getDirs(THEME_DIR, function (dirs) {
    var iterator = function (dir, cb)  {
      var themeInfoPath = THEME_DIR+"/"+dir+"/"+INFO_FILENAME;
      // sails.log.debug(themeInfoPath);
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
  // sails.log.debug('setPriority', query);
  global.Theme.findOne(query).exec(function found(err, found) {
    // sails.log.debug('found', found);
    if(!err && found) theme.priority = found.priority;
    else sails.log.error("theme priority not set", err);
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
var getThemesSortedByPriority = function (cb) {
  getAvailableThemes(function (availableThemes) {
    var iterator = function (theme, cb) {
      var themePath = THEME_DIR+"/"+theme;
      var themeInfoPath = themePath+"/"+INFO_FILENAME;
      fs.readJson(themeInfoPath, function(err, themeInfo) {
        if(err) {return  sails.log.error(err); cb(err);}
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
      result = sortByPriority(result, false);
      return cb(err, result);
    });
  });
}

var getThemeWithHighestPriority = function (callback) {
  getThemesSortedByPriority(function (err, themes) {
    if(err) callback(err);
    else if(!UtilityService.isArray(themes)) callback("themes is not an array");
    else callback(null, themes[0]);
  });
}

var updateOrCreate = function(theme, cb) {
  ModelService.updateOrCreate('Theme', theme, {'dirname': theme.dirname}, cb);
}

var updateOrCreateEach = function(themes, cb) {
  ModelService.updateOrCreateEach('Theme', themes, 'dirname', cb);
}

var getRootPathOfThemeDirname = function (dirname, cb) {
 return path.normalize(THEME_DIR+"/"+dirname);
}

var getThemeByDirname = function (dirname, callback) {
  getAvailableThemes(function (themes) {
    
    var found = false;
    
    for (var i = 0; i < themes.length && !found; i++) {
      var theme = themes[i];
      if(themes.dirname === dirname) found = true;
      if (found) { 
        sails.log.debug("theme FOUND", dirname);
        return cb(null, theme);
      }
    }
    if(!found) {
      var err = "theme NOT found: "+dirname;
      sails.log.error(err);
      return cb(err);
    }
  });
}

/**
 * Get theme the file was found in.
 * If file was not found in theme with the highest priority,
 * the file with a lower priority will be used instead,
 * and so on..
 */
var getThemeForFile = function (filepath, cb) {
  
  getThemesSortedByPriority(function (err, themes) {
    // sails.log.debug("getThemeForFile", themes);
    
    var found = false;
    
    for (var i = 0; i < themes.length && !found; i++) {
      var theme = themes[i];
      //sails.log.debug(theme.name, theme.dirname);
      var rootpath = getRootPathOfThemeDirname(theme.dirname);
      var fullpath = path.join(rootpath, filepath);
      var found = fs.existsSync(fullpath);
      if (found) { 
        sails.log.debug(fullpath);
        return cb(null, theme);
      } else {
        // sails.log.debug("file NOT found", fullpath);
      }
    }
    if(!found) {
      var error = "file not found in any theme";
      // sails.log.error(error, '.');
      return cb(error, null);
    }
  })
}

/**
 * find file in theme with the heigest priority,
 * if file not found try next theme.
 * If file was found callback the rootpath of founded file in theme.
 */
var getThemeRootPathForFile = function (filepath, cb) {
  getThemeForFile (filepath, function (err, theme) {
    if(!err && theme) {
      var rootpath = getRootPathOfThemeDirname(theme.dirname);
      cb(null, rootpath);
    } else {
      var general_path = path.join(sails.config.paths.public, filepath);
      if(fs.existsSync(general_path)) {
        sails.log.warn("File not found in any theme but in general folder!", general_path);
        cb(null, sails.config.paths.public);
      } else {
        sails.log.debug(err, general_path);
        cb(err, sails.config.paths.public);
      }
    }
  });
}

/**
 * find file in theme with the possible heigest found priority
 * and callback this path
 */
var getThemeFullPathForFile = function (filepath, cb) {
  getThemeForFile (filepath, function (err, theme) {
    if(!err && theme) {
      var rootPath = getRootPathOfThemeDirname(theme.dirname);
      var fullpath = path.join(rootPath, filepath);
      return cb(null, fullpath);
    } else {
      return cb(err, filepath);
    }
  });
}

/**
 * Render view from theme with the highest priority,
 * if view not found try next theme.
 */
var view = function (filepath, res, locals) {
  getThemeFullPathForFile(filepath, function (err, fullpath) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    else {
      // fullpath = path.join('../', fullpath); // WORKAROUND root of view for themes
      sails.log.debug("fullpath", fullpath);
      return res.view(fullpath, locals);
    }
  });
}

/**
 * Load javascript module from api subfolder from theme with the highest priority,
 * if module not found try next theme.
 */
var getApiModule = function (filepath, callback) {
  getThemeFullPathForFile(filepath, function (err, fullpath) {
    if(err) { return callback(err); }
    else {
      // fullpath = path.join('../../', fullpath); // WORKAROUND root of controllers / servides for themes
      return callback(null, require(fullpath));
    }
  });
}

/**
 * Load controller from theme with the highest priority,
 * if controller not found try next theme.
 */
var getController = function (name, callback) {
  var filepath = "api/controllers/"+name+".js";
  getApiModule(filepath, callback);
}

/**
 * Load controller from theme with the highest priority,
 * if controller not found try next theme.
 */
var getService = function (name, callback) {
  var filepath = "api/services/"+name+".js";
  getApiModule(filepath, callback);
}

module.exports = {
  getAvailableThemes: getAvailableThemes
  , getThemesSortedByPriority: getThemesSortedByPriority
  , getThemeWithHighestPriority: getThemeWithHighestPriority
  , updateOrCreate: updateOrCreate
  , updateOrCreateEach: updateOrCreateEach
  , getThemeForFile: getThemeForFile
  , getRootPathOfThemeDirname: getRootPathOfThemeDirname
  , getThemeByDirname: getThemeByDirname
  , getThemeRootPathForFile: getThemeRootPathForFile
  , getThemeFullPathForFile: getThemeFullPathForFile
  , view: view
  , getController: getController
  , getService: getService
};

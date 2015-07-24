/**
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
var path = require("path");
var THEME_DIR = path.resolve(sails.config.paths.public, 'themes');
// sails.log.debug("path.resolve(sails.config.paths", sails.config.paths);

/**
 * TODO move to global
 */
var INFO_FILENAME = "theme.json";

/**
 * Get an array of found theme dirnames
 */
var getAvailableThemes = function (cb) {
  UtilityService.getDirs(THEME_DIR, function (dirs) {
    var iterator = function (dir, cb)  {
      var themeInfoPath = THEME_DIR+"/"+dir+"/"+INFO_FILENAME;
      // sails.log.debug(themeInfoPath);
      fs.exists(themeInfoPath, function(exists) { 
        if(!exists) sails.log.error("[services/ThemeService.js:getAvailableThemes] Info path not found: "+themeInfoPath);
        cb(exists);
      }); 
    }
    async.filter(dirs, iterator, cb);
  });
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
var sortByPriority = function(themes, inverse) {
  return UtilityService.sortArrayByProperty(themes, 'priority', inverse);
};

/**
 * Set Priority in theme parameter from Database and get it back in callback
 */
var setPriority = function (site, theme, cb) {

  var errors = [
    "[services/ThemeService.js:setPriority] Theme priority not set!"
  ]
  
  var query = {'dirname': theme.dirname, site: site};
  // sails.log.debug('setPriority', query);
  global.Theme.findOne(query).exec(function found(err, found) {
    // sails.log.debug('found', found);
    if(!err && found) {
      theme.priority = found.priority;
    } else {
      if(!err) err = errors[0];
      else err = String(err)+" "+errors[0];
      sails.log.warn(err, "Theme:", theme, "Site:", site);
      // return cb(err, theme); // do not break on error, because it is normal that new themes not found in database
    }
    if(UtilityService.isUndefined(theme.priority)) {
      theme.priority = 0;
    }
    cb(null, theme);
  });
};

/**
 * Set Priority like setPriority but for each theme in themesWithInfo-array.
 */
var setPriorities = function (themesWithInfo, cb) {

  var prioritySum = 0;

  var iterator = function (theme, cb) {
    setPriority(theme.site, theme, function (err, theme) {
      prioritySum += theme.priority;
      if(err) {
        sails.log.error("[services/ThemeService.js:setPriorities]", err);
        return cb(err);
      }
      return cb(null, theme);
    });
  }
  async.map(themesWithInfo, iterator, function (err, themesWithPriority) {
    // if the prioritySum is 0, no theme has a higher priority so this is not okay
    if(prioritySum <= 0) {
      return cb("[services/ThemeService.js:setPriorities]The priority summery is <= 0");
    }
    cb(null, themesWithPriority);

  });

}

/**
 * Get Falback Theme from local.json for site, used if no priority is found.
 */
var setPriorityForFallbackTheme = function (siteConfig, themes, callback) {
  var errors = [
    "[services/ThemeService.js] Error: Fallback theme is not defined in local.json"
  ]
  // sails.log.debug("[services/ThemeService.js] setPriorityForFallbackTheme");

  if(UtilityService.isUndefined(siteConfig.fallback.theme)) {
    sails.log.error(errors[0], siteConfig);
    return callback(errors[0]);
  }

  // set fallback theme (defined in local.json) to 1
  getThemeByDirnameFromThemes(themes, siteConfig.fallback.theme, function (err, theme, index) {
    if(err) return callback(err);
    themes[index].priority = 1;
    callback(null, themes, themes[index], index);
  });
};

/**
 * WARN: Gets the information from filesystem, not from database
 */
var setThemeInfos = function (siteConfig, availableThemes, callback) {
  var iterator = function (theme, cb) {
    var themePath = THEME_DIR+"/"+theme;
    var themeInfoPath = themePath+"/"+INFO_FILENAME;
    fs.readJson(themeInfoPath, function(err, themeInfo) {
      if(err) {
        sails.log.error(err);
        return cb(err);
      }
      // themeInfo.path = themePath;
      themeInfo.dirname = theme;
      themeInfo.site = siteConfig.name
      themeInfo.priority = 0 // default value
      cb(null, themeInfo);
    });
  }
  async.map(availableThemes, iterator, function (err, themes) {
    callback(err, themes);
  });
};

/**
 * 
 */
var getAvailableThemesWithInfo = function (siteConfig, cb) {
  getAvailableThemes(function(themes) {
    setThemeInfos(siteConfig, themes, function (err, themes) {
      cb(err, themes);
    });
  });
};

/**
 * Get themes with info and sorted priority
 */
var getThemesSortedByPriority = function (req, cb) {
  // sails.log.debug("[services/ThemeService.js] getThemesSortedByPriority");
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) return cb(err);
    getAvailableThemesWithInfo(config, function (err, themesWithInfo) {
      setPriorities(themesWithInfo, function (err, themesWithPriority) {
        if(err) {
          // sails.log.warn("[services/ThemeService.js:getThemesSortedByPriority]", err);
          setPriorityForFallbackTheme(config, themesWithInfo, function (err, themesWithPriority, theme, index) {
            if(err) { return cb(err); }
            result = sortByPriority(themesWithPriority, false);
            // sails.log.warn("[services/ThemeService.js:getThemesSortedByPriority] Fallback priority: ", themes);
            return cb(null, result);
          });
        } else {
          result = sortByPriority(themesWithPriority, false);
          // sails.log.debug("[services/ThemeService.js] priority: ", themes);
          // sails.log.debug("[services/ThemeService.js] Priority result without errors ");
          return cb(err, result);
        }
      });
    });
  });
};

/**
 * 
 */
var getThemeWithHighestPriority = function (req, callback) {
  getThemesSortedByPriority(req, function (err, themes) {
    if(err) callback(err);
    else if(!UtilityService.isArray(themes)) callback("themes is not an array");
    else callback(null, themes[0]);
  });
}

/**
 * 
 */
var updateOrCreate = function(req, theme, cb) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) cb(err);
    theme.site = config.name;
    ModelService.updateOrCreate('Theme', theme, {'dirname': theme.dirname, site: theme.site}, cb);
  });
}

/**
 * 
 */
var updateOrCreateEach = function(req, themes, cb) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) cb(err);
    for (var i = themes.length - 1; i >= 0; i--) {
      themes[i].site = config.name;
    };
    ModelService.updateOrCreateEach('Theme', themes, ['dirname', 'site'], cb);
  });
  
}

/**
 * 
 */
var getRootPathOfThemeDirname = function (dirname, cb) {
 return path.normalize(THEME_DIR+"/"+dirname);
}

/**
 * 
 */
var getThemeByDirnameFromThemes = function (themes, dirname, callback) {    
  var found = false;

  // sails.log.debug("[services/ThemeService.js:getThemeByDirnameFromThemes] themes:", themes);

  for (var i = 0; i < themes.length && !found; i++) {

    // themes can be an array of strings
    if(typeof(themes[i]) === 'string') {
      if(themes[i] === dirname) {
        found = true;
        // sails.log.debug("[services/ThemeService.js:getThemeByDirnameFromThemes] "+themes[i]+" === "+dirname+": "+found);
      }
    }

    // or an array of objects with property dirname
    if(typeof(themes[i]) === 'object' && UtilityService.isDefined(themes[i].dirname)) {
      if(themes[i].dirname === dirname) {
        found = true;
      }
      // sails.log.debug("[services/ThemeService.js:getThemeByDirnameFromThemes] "+themes[i].dirname+" === "+dirname+": "+found);
    }

    if (found) { 
      // sails.log.debug("theme FOUND", dirname);
      return callback(null, themes[i], i);
    }
    
  }
  if(!found) {
    var err = "[services/ThemeService.js:getThemeByDirnameFromThemes] Theme NOT found: "+dirname;
    sails.log.error(err);
    return callback(err);
  }
}

/**
 * 
 */
var getThemeByDirname = function (dirname, callback) {
  // sails.log.debug("[services/ThemeService.js:getThemeByDirname]", dirname);
  getAvailableThemes(function (themes) {
    getThemeByDirnameFromThemes(themes, dirname, callback);
  });
}

/**
 * Get theme the file was found in.
 * If file was not found in theme with the highest priority
 * the file with a lower priority will be used instead,
 * and so on..
 */
var getThemeForFile = function (req, filepath, cb) {
  
  getThemesSortedByPriority(req, function (err, themes) {
    // sails.log.debug("getThemeForFile", themes);
    
    var found = false;
    
    for (var i = 0; i < themes.length && !found; i++) {
      var theme = themes[i];
      //sails.log.debug(theme.name, theme.dirname);
      var rootpath = getRootPathOfThemeDirname(theme.dirname);
      var fullpath = path.join(rootpath, filepath);
      var found = fs.existsSync(fullpath);
      if (found) { 
        // sails.log.debug(fullpath);
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
 * TODO move this to mew AssetService / AssetController ?!
 * Search file in site in current site folder, if file was not found find file in theme with the heigest priority,
 * if file was found callback the rootpath of founded file,
 * if file not found try next theme,
 * if file was not found in any theme try general folder
 */
var getDirnameForAssetspath = function (req, filepath, cb) {
  MultisiteService.getSiteDirname(req.session.uri.host, filepath, function(err, dirname){
    if(!err) {
      // sails.log.debug("File found in site dirname.", dirname);
      cb(null, dirname);
    } else {
      getThemeForFile (req, filepath, function (err, theme) {
        if(!err && theme) {
          // sails.log.debug("File found in theme but not in site dirname.", theme);
          var rootpath = getRootPathOfThemeDirname(theme.dirname);
          cb(null, rootpath);
        } else {
          MultisiteService.getFallbackDirname(filepath, function(err, dirname){
            if(!err) {
              sails.log.warn("File not found in any site or theme but in fallback path!", dirname);
              cb(null, dirname);
            } else {
              sails.log.error(err, dirname);
              cb(err, dirname);
            }
          });
        }
      });
    }
  });
}

/**
 * find file in theme with the possible heigest found priority
 * and callback this path
 */
var getThemeFullPathForFile = function (req, filepath, cb) {
  getThemeForFile (req, filepath, function (err, theme) {
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
var view = function (req, filepath, res, locals) {
  getThemeFullPathForFile(req, filepath, function (err, fullpath) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    else {
      // fullpath = path.join('../', fullpath); // WORKAROUND root of view for themes
      // sails.log.debug("fullpath", fullpath);
      return res.view(fullpath, locals);
    }
  });
}

/**
 * Load javascript module from api subfolder from theme with the highest priority,
 * if module not found try next theme.
 */
var getApiModule = function (req, filepath, callback) {
  getThemeFullPathForFile(req, filepath, function (err, fullpath) {
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
var getController = function (req, name, callback) {
  var filepath = "api/controllers/"+name+".js";
  getApiModule(req, filepath, callback);
}

/**
 * Load controller from theme with the highest priority,
 * if controller not found try next theme.
 */
var getService = function (name, callback) {
  var filepath = "api/services/"+name+".js";
  getApiModule(req, filepath, callback);
}

/**
 * 
 */
module.exports = {
  getAvailableThemes: getAvailableThemes
  , getThemesSortedByPriority: getThemesSortedByPriority
  , getThemeWithHighestPriority: getThemeWithHighestPriority
  , updateOrCreate: updateOrCreate
  , updateOrCreateEach: updateOrCreateEach
  , getThemeForFile: getThemeForFile
  , getRootPathOfThemeDirname: getRootPathOfThemeDirname
  , getThemeByDirname: getThemeByDirname
  , getDirnameForAssetspath: getDirnameForAssetspath
  , getThemeFullPathForFile: getThemeFullPathForFile
  , view: view
  , getController: getController
  , getService: getService
};

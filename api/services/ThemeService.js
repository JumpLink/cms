/**
 * @see http://sailsjs.org/#!documentation/controllers
 * @see https://github.com/jprichardson/node-fs-extra
 */

var fs = require('fs-extra');
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
    };
    async.filter(dirs, iterator, cb);
  });
};

/**
 * @see ttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
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
  ];
  
  var query = {'dirname': theme.dirname, site: site};
  // sails.log.debug('setPriority', query);
  global.Theme.findOne(query).exec(function (err, found) {
    // sails.log.debug('found', found);
    if(!err && found) {
      theme.priority = found.priority;
    } else {
      if(!err) err = errors[0];
      else err = String(err)+" "+errors[0];
      sails.log.warn(err, "Theme:", theme.name, "Site:", site);
      // return cb(err, theme); // do not break on error, because it is normal that new themes not found in database
    }
    if(UtilityService.isUndefined(theme.priority)) {
      theme.priority = 1;
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
  };
  async.map(themesWithInfo, iterator, function (err, themesWithPriority) {
    // if the prioritySum is 0, no theme has a higher priority so this is not okay
    if(prioritySum <= 0) {
      return cb("[services/ThemeService.js:setPriorities]The priority summery is <= 0");
    }
    cb(null, themesWithPriority);
  });
};

/**
 * Get Fallback Theme from local.json for site, used if no priority is found.
 * The fallback theme will have the priority `2`
 */
var setPriorityForFallbackTheme = function (siteConfig, themes, callback) {
  var errors = [
    "[services/ThemeService.js] Error: Fallback theme is not defined in local.json"
  ];
  // sails.log.debug("[services/ThemeService.js] setPriorityForFallbackTheme");

  if(UtilityService.isUndefined(siteConfig.fallback) || UtilityService.isUndefined(siteConfig.fallback.theme)) {
    sails.log.error(errors[0], siteConfig);
    return callback(errors[0]);
  }

  // set fallback theme (defined in local.json) to 2
  getThemeByDirnameFromThemes(themes, siteConfig.fallback.theme, function (err, theme, index) {
    if(err) return callback(err);
    themes[index].priority = 2;
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
    fs.readJson(themeInfoPath, function(fsError, themeInfo) {
      if(fsError) {
        var error = "Can't parse Theme Info File: "+themeInfoPath+"\n"+fsError;
        sails.log.error(error);
        return cb(error);
      }
      // themeInfo.path = themePath;
      themeInfo.dirname = theme;
      themeInfo.site = siteConfig.name;
      themeInfo.priority = 0; // default value
      cb(null, themeInfo);
    });
  };
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
 * Get themes with info sorted by priority.
 */
var getThemesSortedByPriorityBySiteConfig = function (config, cb) {
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
};

/**
 * Get themes with info sorted by priority.
 */
var getThemesSortedByPriority = function (host, cb) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getThemesSortedByPriority] Host must be a string!"));
  // sails.log.debug("[services/ThemeService.js] getThemesSortedByPriority");
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) return cb(err);
    getThemesSortedByPriorityBySiteConfig(config, cb);
  });
};

/**
 * Get Theme with highest priority for host
 */
var getThemeWithHighestPriorityBySiteConfig = function (config, callback) {
  getThemesSortedByPriorityBySiteConfig(config, function (err, themes) {
    if(err) return callback(err);
    if(!UtilityService.isArray(themes)) return callback("themes is not an array");
    return callback(null, themes[0]);
  });
};

/**
 * Get Theme with highest priority for host
 */
var getThemeWithHighestPriority = function (host, callback) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getThemesSortedByPriority] Host must be a string!"));
  getThemesSortedByPriority(host, function (err, themes) {
    if(err) return callback(err);
    if(!UtilityService.isArray(themes)) return callback("themes is not an array");
    return callback(null, themes[0]);
  });
};

/**
 * Alias for getThemeWithHighestPriority
 * 
 * @see ThemeService.getThemeWithHighestPriority
 */
var getTheme = function (host, callback) {
  return getThemeWithHighestPriority(host, callback);
};

var getAdminConfigAndTheme = function (callback) {
  MultisiteService.getSiteConfigByName('admin', function (err, config) {
    if(UlilityService.isDefined(err) && err !== null) {
      return cb(err);
    }
    ThemeService.getThemeWithHighestPriorityBySiteConfig(config, function(err, theme) {
      if(UlilityService.isDefined(err) && err !== null) {
        return cb(err);
      }
      callback(null, config, theme);
    });
  });
};

/**
 * 
 */
var updateOrCreate = function(host, theme, cb) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) cb(err);
    theme.site = config.name;
    ModelService.updateOrCreate('Theme', theme, {'dirname': theme.dirname, site: theme.site}, cb);
  });
};

/**
 * 
 */
var updateOrCreateEach = function(host, themes, cb) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) cb(err);
    for (var i = themes.length - 1; i >= 0; i--) {
      themes[i].site = config.name;
    }
    ModelService.updateOrCreateEach('Theme', themes, ['dirname', 'site'], cb);
  });
};

/**
 * 
 */
var getRootPathOfThemeDirname = function (dirname, cb) {
 return path.normalize(THEME_DIR+"/"+dirname);
};

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
};

/**
 * 
 */
var getThemeByDirname = function (dirname, callback) {
  // sails.log.debug("[services/ThemeService.js:getThemeByDirname]", dirname);
  getAvailableThemes(function (themes) {
    getThemeByDirnameFromThemes(themes, dirname, callback);
  });
};

/**
 * Get theme the file was found in.
 * If file was not found in theme with the highest priority
 * the file with a lower priority will be used instead,
 * and so on..
 */
var getThemeForFile = function (host, filepath, cb) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getThemeForFile] Host must be a string!"));
  getThemesSortedByPriority(host, function (err, themes) {
    if(err) return cb(err);
    // sails.log.debug("getThemeForFile", themes);
    
    var found = false;
    
    for (var i = 0; i < themes.length && !found; i++) {
      var theme = themes[i];
      //sails.log.debug(theme.name, theme.dirname);
      var rootpath = getRootPathOfThemeDirname(theme.dirname);
      var fullpath = path.join(rootpath, filepath);
      found = fs.existsSync(fullpath);
      if (found) { 
        // sails.log.debug(fullpath);
        return cb(null, theme);
      } else {
        // sails.log.debug("file NOT found", fullpath);
      }
    }
    if(!found) {
      var error = "[ThemeService.getThemeForFile] File not found in any theme";
      // sails.log.error(error, '.');
      return cb(error+" "+filepath, null);
    }
  });
};

/**
 * Function get dirname for filepath from current site folder,
 * if no site was found, it looks file in theme with the heigest priority.
 * Otherwise it will be loaded from theme with lower piority and so on..
 * If no priority is set, the fallback theme defined in local.json has the highest priority `2`.
 */
var getDirnameForAssetspath = function (host, filepath, cb) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getDirnameForAssetspath] Host must be a string!"));
  MultisiteService.getSiteDirname(host, filepath, function(err, dirname){
    if(!err) {
      // sails.log.debug("File found in site dirname.", dirname);
      cb(null, dirname);
    } else {
      getThemeForFile(host, filepath, function (err, theme) {
        if(!err && theme) {
          // sails.log.debug("File found in theme but not in site dirname.", theme);
          var rootpath = getRootPathOfThemeDirname(theme.dirname);
          cb(null, rootpath);
        } else {
          MultisiteService.getFallbackDirname(filepath, function(err, dirname){
            if(!err) {
              sails.log.warn("[ThemeService.getDirnameForAssetspath] File not found in any site or theme but in fallback path!", dirname);
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
};

/**
 * Find file in theme with the possible heigest found priority and callback this path.
 */
var getThemeFullPathForFile = function (host, filepath, cb) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getThemeFullPathForFile] Host must be a string!"));
  getThemeForFile(host, filepath, function (err, theme) {
    if(!err && theme) {
      var rootPath = getRootPathOfThemeDirname(theme.dirname);
      var fullpath = path.join(rootPath, filepath);
      return cb(null, fullpath);
    } else {
      return cb(err, filepath);
    }
  });
};

/**
 * Loads files (like assets) dynamically.
 * Function searchs file in site in current site folder,
 * if no file was found, looks file in theme with the heigest priority.
 * Otherwise it will be loaded from theme with lower piority and so on..
 * If no priority is set, the fallback theme defined in local.json has the highest priority "2".
 *
 * @param {string} name - the name of the theme dirname
 * @param {string} filepath - the relative path for the file
 * @param {object} [options] - unused
 * @param {callback} cb - Callback for error or the result
 * @see ThemeService.getFile
 */
var getFileByThemeDirname = function (name, filepath, options, cb) {
  var errors = [
    "[ThemeService.getFileByThemeDirname] Not found!",
    "[ThemeService.getFileByThemeDirname] name must be a string!"
  ];
  sails.log.debug("[ThemeService.getFileByThemeDirname]");

  if(typeof(name) !== "string") return cb(new Error(errors[1]));

  var rootpath = ThemeService.getRootPathOfThemeDirname(name);
  var fullpath = path.join(rootpath, filepath);
  fs.exists(fullpath, function (exists) {
    if(!exists) return cb(errors[0]+" (In theme "+name+")");
    return cb(null, fullpath);
  });
};

/**
 * Loads files (like assets) dynamically.
 * Function searchs file in site in current site folder,
 * if no file was found, looks file in theme with the heigest priority.
 * Otherwise it will be loaded from theme with lower piority and so on..
 * If no priority is set, the fallback theme defined in local.json has the highest priority "2".
 *
 * @param {string} host - the host of the coming request
 * @param {string} filepath - the relative path for the file
 * @param {object} [options] - options for file source
 * @param {string} [options.theme] - If set the asset is loaded from the passed theme
 * @param {string} [options.site] - If set the asset is loaded from the passed sitename
 * @param {callback} cb - Callback for error or the result
 * @see ThemeService.getDirnameForAssetspath
 */
var getFile = function (host, filepath, options, cb) {
  var errors = [
    "[ThemeService.getFile] Not found!",
    "[ThemeService.getFile] Host must be a string!"
  ];
  sails.log.debug("[ThemeService.getFile]");

  if(typeof(host) !== "string") return cb(new Error(errors[1]));

  if(options) {
    if(typeof (options.theme) === 'string') {
      return getFileByThemeDirname(options.theme, filepath, options, cb);
    }

    if(typeof(options.site) === 'string') {
      MultisiteService.getSiteDirname(host, filepath, function(err, rootpath){
        if(err) return cb(err);
        var fullpath = path.join(rootpath, filepath);
        fs.exists(fullpath, function (exists) {
          if(!exists) return cb(errors[0]+" (In site "+options.site+")");
          return cb(null, fullpath);
        });
      });
    }
  }

  ThemeService.getDirnameForAssetspath(host, filepath, function (err, rootpath) {
    if(err || rootpath === null) {
      sails.log.error(err, filepath);
      return cb(err);
    }
    var fullpath = path.join(rootpath, filepath);
    fs.exists(fullpath, function (exists) {
      if(!exists) {
        sails.log.error(errors[0]+" ("+filepath+")");
        return cb(errors[0]);
      }
      return cb(null, fullpath);
    });
  });
};

/**
 * Render view from theme with the highest priority,
 * if view not found try next theme.
 */
var view = function (host, filepath, res, locals, options) {
  if(!options) options = {};
  var route = options.route;
  // getThemeFullPathForFile(host, filepath, function (err, fullpath) {
  getFile(host, filepath, options, function (err, fullpath) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    // fullpath = path.join('../', fullpath); // WORKAROUND root of view for themes
    sails.log.debug("[ThemeService.view] fullpath", fullpath);
    return res.view(fullpath, locals);
  });
};

/**
 * Render view from theme with the highest priority,
 * if view not found try next theme.
 */
var viewByThemeDirname = function (name, filepath, res, locals, options) {
  if(!options) options = {};
  var route = options.route;
  getFileByThemeDirname(name, filepath, options, function (err, fullpath) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    // fullpath = path.join('../', fullpath); // WORKAROUND root of view for themes
    sails.log.debug("[ThemeService.viewThemeDirname] fullpath", fullpath);
    return res.view(fullpath, locals);
  });
};

/**
 * Load javascript module from api subfolder from theme with the highest priority,
 * if module not found try next theme.
 */
var getApiModule = function (host, filepath, callback) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getApiModule] Host must be a string!"));
  getThemeFullPathForFile(host, filepath, function (err, fullpath) {
    if(err) { return callback(err); }
    else {
      // fullpath = path.join('../../', fullpath); // WORKAROUND root of controllers / servides for themes
      return callback(null, require(fullpath));
    }
  });
};

/**
 * Load fallback routes from theme with the highest priority,
 * if routes not found try next theme.
 */
var getFallbackRoutes = function (host, callback) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getFallbackRoutes] Host must be a string!"));
  var filepath = "config/fallback/routes.js";
  getApiModule(host, filepath, callback);
};

/**
 * Load controller from theme with the highest priority,
 * if controller not found try next theme.
 */
var getController = function (host, name, callback) {
  if(typeof(host) !== "string") return cb(new Error("[ThemeService.getController] Host must be a string!"));
  var filepath = "api/controllers/"+name+".js";
  getApiModule(host, filepath, callback);
};

/**
 * Load controller from theme with the highest priority,
 * if controller not found try next theme.
 */
var getService = function (name, callback) {
  var filepath = "api/services/"+name+".js";
  getApiModule(host, filepath, callback);
};

/**
 * 
 */
module.exports = {
  getAvailableThemes: getAvailableThemes,
  getThemesSortedByPriorityBySiteConfig: getThemesSortedByPriorityBySiteConfig,
  getThemesSortedByPriority: getThemesSortedByPriority,
  getThemeWithHighestPriorityBySiteConfig: getThemeWithHighestPriorityBySiteConfig,
  getThemeWithHighestPriority: getThemeWithHighestPriority,
  getTheme: getTheme,
  getAdminConfigAndTheme: getAdminConfigAndTheme,
  updateOrCreate: updateOrCreate,
  updateOrCreateEach: updateOrCreateEach,
  getThemeForFile: getThemeForFile,
  getRootPathOfThemeDirname: getRootPathOfThemeDirname,
  getThemeByDirname: getThemeByDirname,
  getDirnameForAssetspath: getDirnameForAssetspath,
  getThemeFullPathForFile: getThemeFullPathForFile,
  getFile: getFile,
  getFileByThemeDirname: getFileByThemeDirname,
  view: view,
  viewByThemeDirname: viewByThemeDirname,
  getFallbackRoutes: getFallbackRoutes,
  getController: getController,
  getService: getService,
};

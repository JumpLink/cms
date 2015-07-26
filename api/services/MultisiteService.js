/**
 * 
 */

var path = require('path');
var fs = require('fs'); // var fs = require('fs-extra');

/**
 * Get the corrent Site config from local.json that matchs the current host domain 
 *
 * @param {string} host - The current host of the site this function was called.
 * @param {siteConfCallback} [cb] - The callback that handles the response.
 * @returns {object|null} Returns the result or null if no callback is set. 
 */
var getCurrentSiteConfig = function (host, cb) {
  var errors = [
    "[services/MultisiteService.js] No site for host "+host+" in local.json defined!"
  ];
  // sails.log.debug("[services/MultisiteService] Get current site config for host: "+host);
  
  var found = false;
  for (var i = sails.config.sites.length - 1; i >= 0 && !found; i--) {
    for (var k = sails.config.sites[i].domains.length - 1; k >= 0 && !found; k--) {

      // TODO generate al regex on bootstrap
      var regex = ".*"+sails.config.sites[i].domains[k].replace(/\./g , "\\\."); // www.bugwelder.com => /www\.bugwelder\.com/g
      var pattern = new RegExp(regex, 'g');

      if(pattern.test(host)) {
        // sails.log.debug("[services/MultisiteService.js] Match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
        found = true;
        if (cb) return cb(null, sails.config.sites[i]);
        else return sails.config.sites[i];
      } else {
        // sails.log.debug("[services/MultisiteService.js] No match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
      }
    };
  };
  if (cb) return cb(new Error(errors[0]));
  else return null;
};

/**
 * getCurrentSiteConfig callback
 * @callback siteConfCallback
 * @param {string|null} error
 * @param {object} config
 */

/**
 * TODO move this to mew AssetService / AssetController ?!
 */
var getFallbackDirname = function (filepath, cb) {
  var dirname = path.resolve(sails.config.paths.public, sails.config.paths.sites, sails.config.paths.fallback);
  var fullpath = path.join(dirname, filepath);
  if(fs.existsSync(fullpath)) {
    cb(null, dirname);
  } else {
    var err = "[MultisiteService.getFallbackDirname] File not found in fallback assets dirname: "+fullpath;
    // sails.log.debug(err, fullpath);
    cb(err, dirname);
  }
};

/**
 * TODO move this to mew AssetService / AssetController ?!
 */
var getSiteDirname = function (host, filepath, cb) {
  // sails.log.debug("host", host, "filepath", filepath);
  // var config = MultisiteService.getCurrentSiteConfig(host);

  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) {
      var err = "[MultisiteService.getSiteDirname] No site for host defined: "+host;
      cb(err, null);
    } else {
      var site = config.name;
      var dirname = path.resolve(sails.config.paths.public, sails.config.paths.sites, site);
      var fullpath = path.join(dirname, filepath);
      // sails.log.debug("site", site, "dirname", dirname, "fullpath", fullpath);
      if(fs.existsSync(fullpath)) {
        cb(null, dirname);
      } else {
        var err = "[MultisiteService.getSiteDirname] File not found in site assets dirname: "+fullpath;
        // sails.log.debug(err, dirname);
        cb(err, null);
      }
    }
  });
};

/**
 * TODO move this to mew AssetService / AssetController ?!
 */
module.exports = {
  getCurrentSiteConfig: getCurrentSiteConfig,
  getFallbackDirname: getFallbackDirname,
  getSiteDirname: getSiteDirname
};
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
    "[MultisiteService.getCurrentSiteConfig] No site for host "+host+" in local.json defined!"
  ];
  sails.log.debug("[MultisiteService.getCurrentSiteConfig] Get current site config for host: "+host);
  
  var found = false;
  for (var i = 0; i < sails.config.sites.length && !found; i++) {
    for (var k = 0; k < sails.config.sites[i].domains.length && !found; k++) {
      // TODO generate al regex on bootstrap
      var regex = sails.config.sites[i].domains[k];
      if(!sails.config.sites[i].matchsubdomain)
        regex = ".*"+regex;
      var regex = regex.replace(/\./g , "\\\."); // www.bugwelder.com => /www\.bugwelder\.com/g
      
      var pattern = new RegExp(regex, 'g');

      if(pattern.test(host)) {
        sails.log.debug("[MultisiteService.getCurrentSiteConfig] Match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
        found = true;
        if (cb) return cb(null, sails.config.sites[i]);
        else return sails.config.sites[i];
      } else {
        sails.log.debug("[services/MultisiteService.js] No match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
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
 * Get fallcack site dirname as a last alternative.
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
 *
 */
var getSitePathFromSiteConf = function (config, cb) {
  var site = config.name;
  var dirname = path.resolve(sails.config.paths.public, sails.config.paths.sites, site);
  if(cb) return cb(null, dirname);
  return dirname;
};

/**
 * Get site dirname from siteConf.
 * Use this function if you have already the siteconf. 
 */
var getSiteDirnameFromSiteConf = function (config, filepath, cb) {
  var dirname = getSitePathFromSiteConf(config);
  var fullpath = path.join(dirname, filepath);
  // sails.log.debug("site", site, "dirname", dirname, "fullpath", fullpath);
  if(fs.existsSync(fullpath)) {
    if(cb) return cb(null, dirname);
    return dirname;
  } else {
    var err = "[MultisiteService.getSiteDirname] File not found in site assets dirname: "+fullpath;
    // sails.log.debug(err, dirname);
    if(cb) return cb(err);
    return null;
  }
};

/**
 * Get site dirname from host.
 */
var getSiteDirname = function (host, filepath, cb) {
  // sails.log.debug("host", host, "filepath", filepath);
  // var config = MultisiteService.getCurrentSiteConfig(host);

  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) {
      var err = "[MultisiteService.getSiteDirname] No site for host defined: "+host;
      return cb(err, null);
    }
    getSiteDirnameFromSiteConf(config, filepath, cb);
  });
};

/**
 * The following functions are public
 */
module.exports = {
  getSitePathFromSiteConf: getSitePathFromSiteConf,
  getSiteDirnameFromSiteConf: getSiteDirnameFromSiteConf,
  getCurrentSiteConfig: getCurrentSiteConfig,
  getFallbackDirname: getFallbackDirname,
  getSiteDirname: getSiteDirname
};
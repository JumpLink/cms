var path = require('path');
var fs = require('fs'); // var fs = require('fs-extra');

module.exports = {
  /**
   * Get the corrent Site config from local.json that matchs the current host domain 
   */
  getCurrentSiteConfig: function (host) {
    
    var found = false;
    for (var i = sails.config.sites.length - 1; i >= 0 && !found; i--) {
      for (var k = sails.config.sites[i].domains.length - 1; k >= 0 && !found; k--) {

        // TODO generate al regex on bootstrap
        var regex = ".*"+sails.config.sites[i].domains[k].replace(/\./g , "\\\."); // www.bugwelder.com => /www\.bugwelder\.com/g
        var pattern = new RegExp(regex, 'g');

        if(pattern.test(host)) {
          // sails.log.debug("Match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
          found = true;
          return sails.config.sites[i];
        } else {
          // sails.log.debug("No match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
        }
      };
    };
    return null;
  },

  // TODO move this to mew AssetService / AssetController ?!
  getFallbackAssetsDirname: function (filepath, cb) {
    var dirname = path.resolve(sails.config.paths.public, sails.config.paths.sites, sails.config.paths.fallback);
    var fullpath = path.join(dirname, filepath);
    if(fs.existsSync(fullpath)) {
      cb(null, dirname);
    } else {
      var err = "file not found in fallback assets dirname: "+fullpath;
      // sails.log.debug(err, fullpath);
      cb(err, dirname);
    }
  },

  // TODO move this to mew AssetService / AssetController ?!
  getSiteAssetsDirname: function (host, filepath, cb) {
    // sails.log.debug("host", host, "filepath", filepath);
    var site = MultisiteService.getCurrentSiteConfig(host).name;
    var dirname = path.resolve(sails.config.paths.public, sails.config.paths.sites, site);
    var fullpath = path.join(dirname, filepath);
    // sails.log.debug("site", site, "dirname", dirname, "fullpath", fullpath);
    if(fs.existsSync(fullpath)) {
      cb(null, dirname);
    } else {
      var err = "file not found in site assets dirname: "+fullpath;
      // sails.log.debug(err, dirname);
      cb(err, dirname);
    }
  } 
}
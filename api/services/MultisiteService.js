var path = require('path');
var fs = require('fs'); // var fs = require('fs-extra');

module.exports = {
  /**
   * Get the corrent Site config from local.json that matchs the current host domain 
   */
  getCurrentSiteConfig: function (host, cb) {
    
    var found = false;
    for (var i = sails.config.sites.length - 1; i >= 0 && !found; i--) {
      for (var k = sails.config.sites[i].domains.length - 1; k >= 0 && !found; k--) {

        // TODO generate al regex on bootstrap
        var regex = ".*"+sails.config.sites[i].domains[k].replace(/\./g , "\\\."); // www.bugwelder.com => /www\.bugwelder\.com/g
        var pattern = new RegExp(regex, 'g');

        if(pattern.test(host)) {
          // sails.log.debug("Match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
          found = true;
          if (cb) return cb(null, sails.config.sites[i]);
          else return sails.config.sites[i];
        } else {
          // sails.log.debug("No match! "+pattern+" ("+sails.config.sites[i].domains[k]+") <=> "+host);
        }
      };
    };
    if (cb) return cb("No site for host "+host+" in local.json defined!");
    else return null;
  },

  // TODO move this to mew AssetService / AssetController ?!
  getFallbackDirname: function (filepath, cb) {
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
  getSiteDirname: function (host, filepath, cb) {
    // sails.log.debug("host", host, "filepath", filepath);
    // var config = MultisiteService.getCurrentSiteConfig(host);

    MultisiteService.getCurrentSiteConfig(host, function (err, config) {
      if(err) {
        var err = "No site for host defined: "+host;
        cb(err, null);
      } else {
        var site = config.name;
        var dirname = path.resolve(sails.config.paths.public, sails.config.paths.sites, site);
        var fullpath = path.join(dirname, filepath);
        // sails.log.debug("site", site, "dirname", dirname, "fullpath", fullpath);
        if(fs.existsSync(fullpath)) {
          cb(null, dirname);
        } else {
          var err = "file not found in site assets dirname: "+fullpath;
          // sails.log.debug(err, dirname);
          cb(err, null);
        }
      }
    });
  } 
}
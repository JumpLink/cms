/**
 * Info about CMS that can readed by normal users
 */
var path = require('path');
var package = require('../../package.json');
// var forever = require('forever-monitor');
// var monitor = new (forever.Monitor)('/var/www/cms/cms.js', {childExists:true});

/**
 * Info about CMS that can readed by normal users
 */
var infoUser = function (callback) {
  var info = {
    version: package.version,
    license: package.license,
    runtime: {
      title: path.basename(process.title),
      version: process.version
    },
    config: {
      environment: sails.config.environment,
      port: sails.config.port,
    }
  };

  return callback(null, info);
};

/**
 * Info about CMS only for super admins
 */
var infoAdmin = function (callback) {
  sails.log.debug("[CmsService.infoAdmin]");
  infoUser(function (err, info) {
    info = UtilityService.extend(info, package);
    info.path = process.mainModule.filename;
    info.dirname = path.dirname(process.mainModule.filename);

    info.runtime.versions = process.versions;
    info.runtime.arch = process.arch;
    info.runtime.platform = process.platform;
    info.runtime.execPath = process.execPath;

    info.config.paths = sails.config.paths;
    info.config.sites = sails.config.sites;
    // TODO more?

    sails.pm2.describe('cms', function (err, desc) {
      info.pm2 = desc;
      // sails.log.debug("[CmsService.infoAdmin] info", info);
      return callback(null, info);
    });
  });
};

/**
 * Restart the CMS
 */
var restart = function(callback) {
  sails.log.debug("[CmsService.restart]");
  sails.pm2.restart('cms', function () {
    sails.pm2.disconnect(callback);
  });
};

/**
 * Restart the CMS
 */
var stop = function(callback) {
  sails.log.debug("[CmsService.stop]");
  sails.pm2.stop('cms', function () {
    sails.pm2.disconnect(callback);
  });
};

/**
 * Public functions
 */
module.exports = {
  infoUser: infoUser,
  infoAdmin: infoAdmin,
  restart: restart,
  stop: stop,
}
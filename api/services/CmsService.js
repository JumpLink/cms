var path = require('path');
var package = require('../../package.json');

/*
 * Info about CMS that can readed by normal users
 */
var infoUser = function (callback) {
  var info = {
    version: package.version,
    license: package.license,
    runtime: {
      title: process.title,
      version: process.version
    },
  };

  return callback(null, info);
}

/*
 * Info about CMS only for super admins
 */
var infoAdmin = function (callback) {
  var info = package;

  info.path = process.mainModule.filename,
  info.dirname = path.dirname(process.mainModule.filename),

  info.runtime = {
    title: process.title,
    version: process.version,
    versions: process.versions,
    arch: process.arch,
    platform: process.platform,
    execPath: process.execPath,
  };

  return callback(null, info);
}

module.exports = {
  infoUser:infoUser,
  infoAdmin:infoAdmin
}
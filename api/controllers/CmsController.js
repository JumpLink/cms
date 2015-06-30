/**
 * ContentController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trjauigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

// var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

var path = require('path');
var package = require('../../package.json');

module.exports = {

  /*
   * Info about CMS that can readed by normal users
   */
  infoUser: function(req, res) {
    var info = {
      version: package.version,
      license: package.license,
      runtime: {
        title: process.title,
        version: process.version
      },
    };

    sails.log.debug(info);
    res.json(info);
  },

  /*
   * Info about CMS only for super admins
   */
  infoAdmin: function(req, res) {
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

    sails.log.debug(info);
    res.json(info);
  }

};

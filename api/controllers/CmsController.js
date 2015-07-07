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

module.exports = {

  /*
   * Info about CMS that can readed by normal users
   */
  infoUser: function(req, res) {
    CmsService.infoUser(function (error, result) {
      sails.log.debug(result);
      res.json(result);
    });
  },

  /*
   * Info about CMS only for super admins
   */
  infoAdmin: function(req, res) {
    CmsService.infoAdmin(function (error, result) {
      sails.log.debug(result);
      res.json(result);
    });
  }

};

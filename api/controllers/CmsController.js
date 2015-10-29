/**
 * Controller to get information about the CMS like Version, Runtime, etc.
 */

/**
 * 
 */
var setup = function(req, res) {
  res.ok();
};

/**
 * Information about the CMS for normal visitors / users.
 */
var infoUser = function(req, res) {
  CmsService.infoUser(function (error, result) {
    sails.log.debug(result);
    res.json(result);
  });
};

/**
 * Info about CMS only for super admins.
 */
var infoAdmin = function(req, res) {
  CmsService.infoAdmin(function (error, result) {
    sails.log.debug(result);
    res.json(result);
  });
};

/**
 * Restart the CMS
 */
var restart = function(req, res) {
  sails.log.debug("[CmsService.restart]");
  CmsService.restart(function () {
    res.ok();
  });
};

/**
 * Stop the CMS
 */
var stop = function(req, res) {
  sails.log.debug("[CmsService.stop]");
  CmsService.restart(function () {
    res.ok();
  });
};

/**
 * Public API
 */
module.exports = {
  setup: setup,
  infoUser: infoUser,
  infoAdmin: infoAdmin,
  restart: restart,
  stop: stop,
};

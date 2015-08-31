/**
 * @module Policy
 * @see http://sailsjs.org/#!documentation/policies
 */
var check = function(req, res, next) {
  return ThemeController.check(req, res, next);
};

/**
 * Make this policy available
 */
module.exports = check;

/**
 * sessionAuthDev
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
var sessionAuthDev = function(req, res, next) {

  // Allways allowed on development-mode
  if (sails.config.environment === 'development') {
    return next();
  }

  // Not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js)
  return res.forbidden();
};

/**
 * Make this policy available
 */
module.exports = sessionAuthDev;

/**
 * sessionAuthDev
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // Allways allowed on development-mode
  if (sails.config.environment === 'development') {
    return next();
  }

  // Or User is authenticated
  if (req.session.authenticated) {
    return next();
  }

  // Not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js)
  return res.forbidden();
};

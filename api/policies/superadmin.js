/**
 * Policy to allow any superadmins
 * Assumes that your login action in one of your controllers sets `req.session.user.role = 'superadmin'`
 *
 * @module Policy
 * @see http://sailsjs.org/#!documentation/policies
 */
var superadmin = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller  
  if (req.session.user.role === 'superadmin') {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js)
  return res.forbidden();
};

/**
 * Make this policy available
 */
module.exports = superadmin;

/**
 * Policy to allow any superadmins
 * Assumes that your login action in one of your controllers sets `req.session.user.role = 'superadmin'`
 *
 * @module Policy
 * @see http://sailsjs.org/#!documentation/policies
 */
var superadmin = function(req, res, next) {
  SessionService.superadmin(req.session.uri.host, req.session, function (err, isSuperadmin) {
    if(err) return res.serverError(err);
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js)
    if(!isSuperadmin) {
      return res.forbidden("You need to be a superadmin to do that");
    }
    return next();
  });  
};

/**
 * Make this policy available
 */
module.exports = superadmin;

/**
 * Simple policy to allow any authenticated user
 * Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 *                 
 * @module Policy
 * @see http://sailsjs.org/#!documentation/policies
 */
var authenticated = function(req, res, next) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller  
  SessionService.authenticated(req.session.uri.host, req.session, function (err, isAuthenticated) {
    if(err) return res.serverError(err);
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js)
    if(isAuthenticated !== true) {
      return res.forbidden("You need to be authenticated to do that");
    }
    return next();
  });
};

/**
 * Make this policy available
 */
module.exports = authenticated;

/**
 * developer
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
var developerOrBetter = function(req, res, next) {
  SessionService.developerOrBetter(req.session.uri.host, req.session, function (err, isDeveloperOrBetter) {
    if(err) return res.serverError(err);
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js)
    if(!isDeveloperOrBetter) return res.forbidden();
    if(!isDeveloperOrBetter) {
      return res.forbidden("You must be in developermode or a user with more credentials to do that");
    }
    return next();
  });
};

/**
 * Make this policy available
 */
module.exports = developerOrBetter;

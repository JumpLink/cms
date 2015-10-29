/**
 * Policy to allow any siteadmin
 * Assumes that your login action in one of your controllers sets `req.session.user.role = 'siteadmin'`
 *
 * @module Policy
 * @see http://sailsjs.org/#!documentation/policies
 */
var siteadminOrBetter = function(req, res, next) {
  SessionService.siteadminOrBetter(req.session.uri.host, req.session, function (err, isSiteadminOrBetter) {
    if(err) return res.serverError(err);
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js)
    if(!isSiteadminOrBetter) {
      return res.forbidden("You need to be a siteadmin or better to do that");
    }
    return next();
  });
};

/**
 * Make this policy available
 */
module.exports = siteadminOrBetter;

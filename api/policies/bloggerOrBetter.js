/**
 * Policy to allow any blogger or better rule
 * Assumes that your login action in one of your controllers sets `req.session.user.role = 'blogger'`
 *
 * @module bloggerOrBetter
 * @see http://sailsjs.org/#!documentation/policies
 */
var bloggerOrBetter = function(req, res, next) {
  SessionService.bloggerOrBetter(req.session.uri.host, req.session, function (err, isBloggerOrBetter) {
    if(err) return res.serverError(err);
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js)
    if(!isBloggerOrBetter) {
      return res.forbidden("You need to be a blogger or better to do that");
    }
    return next();
  });
};

/**
 * Make this policy available
 */
module.exports = bloggerOrBetter;

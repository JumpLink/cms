/**
 * Policy to allow employeers to do stuff
 * Assumes that your login action in one of your controllers sets `req.session.user.role = 'employee'`
 *
 * @module Policy
 * @see http://sailsjs.org/#!documentation/policies
 */
var employee = function(req, res, next) {
  return res.forbidden();
  SessionService.employee(req.session.uri.host, req.session, function (err, isEmployee) {
    if(err) return res.serverError(err);
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js)
    if(!isEmployee) {
      return res.forbidden("You need to be a employee to do that");
    }
    return next();
  });  
};

/**
 * Make this policy available
 */
module.exports = employee;

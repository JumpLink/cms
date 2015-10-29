/**
 * API to get the site configuration like email address, passwords, ect for a specific domain / site.
 */

/**
 *
 */
var setup = function(req, res) {
  res.ok();
};

/**
 * 
 */
var find = function (req, res, next) {
  ConfigService.getForCurrentSite(req.session.uri.host, function (err, conf) {
    if(err) { return res.serverError(err); }
    res.json(conf);
  });
};

/**
 * 
 */
module.exports = {
  setup:setup,
  find:find
};

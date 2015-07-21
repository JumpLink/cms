/*
 * API to get the site configuration like email address, passwords, ect for a specific domain / site.
 */

/**
* My method description.  Like other pieces of your comment blocks, 
* this can span multiple lines.
*
* @method methodName
* @param {String} foo Argument 1
* @param {Object} config A config object
* @param {String} config.name The name on the config object
* @param {Function} config.callback A callback function on the config object
* @param {Boolean} [extra=false] Do extra, optional work
* @return {Boolean} Returns true on success
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

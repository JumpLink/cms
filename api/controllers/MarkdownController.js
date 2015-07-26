/**
 * 
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
var find = function (req, res) {
	var options = {};
  var filepath = decodeURIComponent(req.param('filepath'));
  options.theme = req.param('theme');
  options.site = req.param('site');
  options.toHTML = req.param('html');
  sails.log.debug("[MarkdownController.find]", req.session.uri.host, options, filepath);
	MarkdownService.load(req.session.uri.host, filepath, options, function (err, html_or_md_content) {
    if(err) return res.serverError(err);
    sails.log.debug(html_or_md_content);
    return res.ok(html_or_md_content);
	});
};

/**
 * 
 */
module.exports = {
  setup:setup,
  find:find
};

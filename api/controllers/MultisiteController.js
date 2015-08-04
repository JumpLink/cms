/**
 * 
 */

/**
 * Get all sites with config
 */
var find = function(req, res) {
  MultisiteService.find(function (error, sites) {
    if(error) return res.serverError(error);
    res.json(sites);
  });
};

/**
 * Get just all site names
 */
var findNames = function(req, res) {
  MultisiteService.findNames(function (error, sites) {
    if(error) return res.serverError(error);
    res.json(sites);
  });
};

/**
 * 
 */
module.exports = {
  find: find,
  findNames: findNames
};

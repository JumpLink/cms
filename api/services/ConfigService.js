/**
 * 
 */
 
/**
 * 
 */
var getForCurrentSite = function (host, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConf) {
    if(err) { return callback(err); }

    var result = {};

    if(UtilityService.isDefined(sails.config.paths)) result.paths = sails.config.paths;
    if(UtilityService.isDefined(siteConf) && UtilityService.isDefined(siteConf.email) && UtilityService.isDefined(siteConf.email.address)) result.email = siteConf.email.address;
    if(UtilityService.isDefined(host)) result.host = host;

    sails.log.debug("[ConfigService.js] getForCurrentSite", result);

    callback(null, result);
  });
}

/**
 * 
 */
module.exports = {
  getForCurrentSite:getForCurrentSite
}

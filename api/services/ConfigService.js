var getForCurrentSite = function (host, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConf) {
    if(err) { return callback(err); }
    var result = {
      'paths': sails.config.paths,
      'email': siteConf.email.address,
      'host': host
    };

    callback(null, result);
  });
}

module.exports = {
  getForCurrentSite:getForCurrentSite
}
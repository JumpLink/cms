module.exports = {
  
  setup: function(req, res) {
    res.ok();
  },

  find: function (req, res, next) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, siteConf) {
      if(err) { return res.serverError(err); }
      res.json({
        'paths': sails.config.paths,
        'email': siteConf.email.address,
        'host': req.session.uri.host
      });
    });
  }
};

module.exports = {
  
  setup: function(req, res) {
    res.ok();
  },

  find: function (req, res, next) {
    ConfigService.getForCurrentSite(req.session.uri.host, function (err, conf) {
      if(err) { return res.serverError(err); }
      res.json(conf);
    });
  }
};

module.exports = {
  setup: function(req, res) {
    res.ok();
  },

  replaceAll: function (req, res, next) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { return res.serverError(err); }
      var site = config.name;
      var page = req.param('page');
      var datas = req.param('navs');

      for (var i = 0; i < datas.length; i++) {
        datas[i].site = site;
        datas[i].page = page;
      };

      ModelService.updateOrCreateEach('Navigation', datas, ['page', 'site', 'target'], function (err, result) {
        if (err) {
          sails.log.error(err);
          return res.serverError(err);
        } else {
          sails.log.info("Navigation "+req.param('page')+" saved");
          res.status(201);
          return res.json(result);
         }
      });
    });
  },

  replace: function (req, res, next) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { return res.serverError(err); }
      var query = {
        where: {
          page: req.param('page'),
          site: config.name,
          target: req.param('target')
        }
      };
      var data = req.params.all();
      delete data.id;
      data.site = config.name;
      ModelService.updateOrCreate('Navigation', data, query, function (err, result) {
        if (err) {
          sails.log.error(err);
          return res.serverError(err);
        } else {
          sails.log.info("Navigation "+req.param('page')+" saved");
          res.status(201);
          return res.json(result);
         }
      });
    });
  },

  find: function (req, res) {
    var query;
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { return res.serverError(err); }
      query = {
        where: {
          page: req.param('page'),
          site: config.name
        }
      };
      // sails.log.debug("query", query)
      Navigation.find(query).exec(function found(err, navs) {
        if (err || UtilityService.isUndefined(navs) || !navs instanceof Array) return res.serverError({error:err, query:query});
        res.json(navs);
      });
    });
  },

  export: function (req, res) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { return res.serverError(err); }
      var query = { where: { site: config.name }};
      Navigation.find(query).exec(function found(err, navs) {
        if (err) return res.serverError(err);
        if (UtilityService.isUndefined(navs) || !navs instanceof Array) { res.notFound(query.where); }
        else { res.json(navs); }
      });
    });
  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to NavigationController)
   */
  , _config: {}


};

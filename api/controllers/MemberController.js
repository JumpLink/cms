module.exports = {
  setup: function (req, res, next) {
    SetupService.generateMembers(function(err, result) {
      // sails.log.debug("done");
      if(err)
        res.json(err);
      else
        res.json(result);
    });
  }

  , create: function (req, res, next) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { return res.serverError(err); }
      var data = req.params.all();
      data.site = config.name;
      Member.create(data).exec(function create(err, created) {
        // Member.publisCreate(created[0].id, created[0]);
        sails.log.info("created", created);
        res.json(created);
      });
    });

  }

  , update: function (req, res, next) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      var data = req.params.all();
      data.site = config.name;
      var id = data.id || req.param('id');
      Member.update({id:id, site: data.site}, data).exec(function update(err, updated) {
        // Member.publishUpdate(updated[0].id, updated[0]);
        sails.log.info("updated", updated);
        res.json(updated);
      });
    });
  }
  
  , upload: function (req, res) {
    thumbnailOptions = {width: 280, path: sails.config.paths.members};
    FileService.upload(req, sails.config.paths.members, thumbnailOptions, function (err, result) {
      if(err) return res.serverError(err);
      else res.json(result);
    });
  }

  , find: function (req, res) {
    var query;

    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { return res.serverError(err); }

      query = {
        where: {
          site: config.name
        }
      };

      Member.find(query).exec(function found(err, found) {
        if (err) return res.serverError(err);
        // not found
        if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) {
          res.notFound(query.where);
        } else {
          // sails.log.debug("found", found);
          res.json(found);
        }
      });
    });
  }
}

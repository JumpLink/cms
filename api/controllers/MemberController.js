module.exports = {
  setup: function (req, res, next) {
    SetupService.generateMembers(function(err, result) {
      sails.log.debug("done");
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
        sails.log.debug("created", created);
        res.json(created);
      });
    });

  }

  , update: function (req, res, next) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      var data = req.params.all();
      data.site = config.name;
      var id = data.id || req.param('id');
      Member.update({id:id, site: site},data).exec(function update(err, updated) {
        // Member.publishUpdate(updated[0].id, updated[0]);
        sails.log.debug("updated", updated);
        res.json(updated);
      });
    });
  }
  
  , upload: function (req, res) {
    sails.log.debug(req.file);

    // WORKAROUND for BUG https://github.com/balderdashy/skipper/issues/36
    if(req._fileparser.form.bytesExpected > 10000000) {
      sails.log.error('File exceeds maxSize. Aborting.');
      req.connection.destroy();
      return res.end('File exceeds maxSize. Aborting.'); // This doesn't actually get sent, so you can skip this line.
    }

    req.file("file").upload(function (err, files) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      } else {

        MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
          if(err) { return res.serverError(err); }
          // for bind see http://stackoverflow.com/questions/20882892/pass-extra-argument-to-async-map
          async.map(files, MemberService.convertFileIterator.bind(null, config.name), function(err, files) {
            var result = {
              message: files.length + ' file(s) uploaded successfully!',
              files: files
            };
            // sails.log.debug(result);
            return res.json(result);
          });
        });
      }
    });
  },

  find: function (req, res) {
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
          sails.log.debug("found", found);
          res.json(found);
        }
      });
    });
  }
}

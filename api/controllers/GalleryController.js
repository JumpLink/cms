/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var path = require('path');

module.exports = {

  setup: function(req, res) {
    res.ok();
    // GalleryService.generateThumbnailsFromFilesystem(function(err, message) {
    //   if(err) return res.json(err);
    //   async.waterfall([
    //     function destroyAll(callback){
    //       // sails.log.debug("destroyAll");
    //       Gallery.destroy({}, function (err, destroyed) {
    //         // sails.log.debug(destroyed);
    //         callback(err);
    //       });
    //     },
    //     function getNewSetup (callback){
    //       GalleryService.getFilesFromFilesystem(callback);
    //     },
    //     function createNewSetup (newValues, callback){
    //       // sails.log.debug("createNewSetup");
    //       // https://github.com/caolan/async#map
    //       async.map(newValues, Gallery.create, callback);
    //     },
    //   ], function (err, result) {
    //     sails.log.debug("done");
    //     if(err) return res.json(err);
    //     else res.json(result);
    //   });
    // });
  }
  
  // , create: function (req, res, next) {
  //   MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
  //     if(err) { return res.serverError(err); }
  //     var data = req.params.all();
  //     data.site = config.name;
  //     Gallery.create(data).exec(function create(err, created) {
  //       // Gallery.publisCreate(created[0].id, created[0]);
  //       sails.log.debug("created", created);
  //       res.json(created);
  //     });
  //   });

  // }

  , update: function (req, res, next) {
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      var data = req.params.all();
      data.site = config.name;
      var id = data.id || req.param('id');
      Gallery.update({id:id, site: data.site},data).exec(function update(err, updated) {
        Gallery.publishUpdate(updated[0].id, updated[0]);
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
      if (err) { sails.log.error(err); return res.serverError(err); }
      MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        // find all images for this site
        Gallery.find({site: config.name}).exec(function found(err, images) {
          if (err) return res.serverError(err);
          if (UtilityService.isUndefined(images) || !UtilityService.isArray(images)) { res.notFound(); }
          // for bind see http://stackoverflow.com/questions/20882892/pass-extra-argument-to-async-map
          async.map(files, GalleryService.convertFileIterator.bind(null, config.name), function(err, files) {
            if(err) { sails.log.error(err); return res.serverError(err); }
            GalleryService.prepearFilesForDatabase(config.name, files, images, function (err, files) {
              if(err) { sails.log.error(err); return res.serverError(err); }
              // sails.log.debug(files);
              Gallery.create(files, function(err, files) {
                if(err) return res.serverError(err);
                files.forEach(function(file, index) {
                  // TODO not broadcast / fired why?!
                  Gallery.publishCreate(file);
                  sails.log.debug("Gallery.publishCreate(file);", file);
                });
                // sails.log.debug(files);
                res.json(files);
              });
            });
          });
        });

      });
    });
  }

  , find: function (req, res) {

    // TODO to be shure all positions are okay, maybe remove this function
    var fixPosition = function (images) {
      for (var i = 0; i < images.length; i++) {
          images[i].position = i;
      };
      return images;
    };

    var query;
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { return res.serverError(err); }

      query = {
        where: {
          site: config.name
        },
        sort: 'position'
      };

      Gallery.find(query).exec(function found(err, images) {
        if (err) return res.serverError(err);
        // not found
        if (UtilityService.isUndefined(images) || !UtilityService.isArray(images)) {
          res.notFound(query.where);
        } else {
          // sails.log.debug("images", images);
          images = fixPosition(images);
          res.json(images);
        }
      });
    });
  }

  , destroy: function(req, res) {
    var id = req.param('id');
    var filename = req.param('filename');
    console.log("destroy image", id, filename);
    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, conf) {
      Gallery.findOne({id:id, site:conf.name}).exec(function found(err, file) {
        if (err) return res.serverError(err);
        GalleryService.removeFromFilesystem(conf.name, file, function(err) {
          if(err) return res.serverError(err);
          Gallery.destroy({id:id, site:conf.name}, function (err, destroyed) {
            Gallery.publishDestroy(id);
            if(err) return res.serverError(err);
            // sails.log.debug(destroyed);
            res.ok();
          });
        });
      });
    });
  }

};

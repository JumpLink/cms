/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var path = require('path');

/**
 * 
 */
var setup = function(req, res) {
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
};

/**
 * 
 */
var update = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var data = req.params.all();
    data.site = config.name;
    var id = data.id || req.param('id');
    Gallery.update({id:id, site: data.site},data).exec(function update(err, updated) {
      Gallery.publishUpdate(updated[0].id, updated[0]);
      sails.log.debug("updated", updated);
      res.json(updated);
    });
  });
};

/**
 * 
 */
var upload = function (req, res) {
  thumbnailOptions = {width: 280, path: sails.config.paths.gallery};
  FileService.upload(req, sails.config.paths.gallery, thumbnailOptions, function (err, result) {
    if(err) return res.serverError(err);
    // sails.log.debug("GalleryController: file upload result", result);
    var files = result.files;
    var site = result.site;
    // find all images for this site
    GalleryService.find({where: {site: site}}, function found(err, images) {
      if (err) return res.serverError(err);
      GalleryService.prepearFilesForDatabase(site, files, images, function (err, files) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        // sails.log.debug("GalleryService: prepear files for database result", files);
        Gallery.create(files, function(err, files) {
          if(err) return res.serverError(err);
          files.forEach(function(file, index) {
            // TODO not broadcast / fired why?!
            Gallery.publishCreate(file);
            // sails.log.debug("Gallery.publishCreate(file);", file);
          });
          res.json({
            message: files.length + ' file(s) uploaded successfully!',
            files:files,
            images:images
          });
        });
      });
    });
  });
};

/**
 * 
 */
var find = function (req, res) {
  var query;
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }

    query = {
      where: {
        site: config.name
      }
    };

    if(req.param('content')) {
      query.where.content = req.param('content');
    }

    GalleryService.find(query, function (err, images) {
      if (err) return res.serverError(err);
      else res.json(images);
    });
  });
};

/**
 * 
 */
var destroy = function(req, res) {
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
};

module.exports = {
  setup:setup,
  update:update,
  upload:upload,
  find:find,
  destroy:destroy
};

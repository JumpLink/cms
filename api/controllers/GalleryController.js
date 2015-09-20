/**
 * GalleryController to find / update / upload / destroy images for galleries
 */

var path = require('path');
var async = require('async');

/**
 * 
 */
var setup = function(req, res, next) {
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
 * Upload a file for the gallery and save file in gallery database
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var upload = function (req, res, next) {
  // sails.log.debug("[GalleryController.upload]");
  async.waterfall([
    function (callback) {
      FileService.upload(req, sails.config.paths.gallery, callback);
    },
    function (uploadResult, callback){
      GalleryService.find({where: {site: uploadResult.site}}, function (err, currentImages) {
        callback(err, uploadResult, currentImages);
      });
    },
    function (uploadResult, currentImages, callback){
      GalleryService.setPositions(uploadResult.site, uploadResult.files, currentImages, callback);
    },
    function (newImages, callback){
      Gallery.create(newImages, callback);
    },
    function (newImages, callback){
      GalleryService.publishEachCreate(newImages, callback);
    }
  ], function (err, newImages) {
    if(err) return res.serverError(err);
    res.json({
      message: newImages.length + ' file(s) uploaded successfully!',
      files:newImages
    });
  });
};

/**
 * Find all images of current site and if set, only for certain content
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var find = function (req, res, next) {
  var query;
  var host = req.session.uri.host;
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { return res.serverError(err); }
    query = {
      where: {
        site: config.name
      }
    };
    if(req.param('content')) query.where.content = req.param('content');
    GalleryService.find(query, function (err, images) {
      if (err) return res.serverError(err);
      else res.json(images);
    });
  });
};

/**
 * Destroy an image with id of current site:
 * * Remove file and thumbnails (etc) from filesystem
 * * Remove file from Gallery Database 
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var destroy = function(req, res, next) {
  var id = req.param('id');
  var filename = req.param('filename');
  var host = req.session.uri.host;
  sails.log.debug("[GalleryController.destroy]", id, filename);
  async.waterfall([
    function (callback) {
      MultisiteService.getCurrentSiteConfig(host, callback);
    },
    function (config, callback) {
      Gallery.findOne({id:id, site:config.name}).exec(function (err, file) {
        callback(err, config, file);
      });
    },
    function (config, file, callback) {
      FileService.removeFromFilesystem(config.name, file, sails.config.paths.gallery, function(err) {
        callback(err, config);
      });
    },
    function (config, file, callback) {
      Gallery.destroy({id:id, site:config.name}, callback);
    }
  ], function (err, destroyed) {
    if(err) return res.serverError(err);
    Gallery.publishDestroy(id);
    res.ok();
  });
};

/**
 * Public API functions
 */
module.exports = {
  setup: setup,
  update: update,
  upload: upload,
  create: upload, // Alias
  find: find,
  destroy: destroy
};

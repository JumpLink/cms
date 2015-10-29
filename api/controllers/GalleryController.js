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
  sails.log.debug("[GalleryController.upload]");
  async.waterfall([
    function (callback) {
      FileService.upload(req, sails.config.paths.gallery, callback);
    },
    function (uploadResult, callback) {
      sails.log.debug("[GalleryController.upload] uploadResult", uploadResult);
      GalleryService.find({where: {site: uploadResult.site}}, function (err, currentImages) {
        callback(err, uploadResult, currentImages);
      });
    },
    function (uploadResult, currentImages, callback){
      sails.log.debug("[GalleryController.upload] currentImages", currentImages);
      GalleryService.setPositions(uploadResult.site, uploadResult.files, currentImages, callback);
    },
    function (newImages, callback){
      sails.log.debug("[GalleryController.upload] newImages", newImages);
      Gallery.create(newImages, callback);
    },
    function (newImages, callback){
      GalleryService.publishEachCreate(newImages, callback);
    }
  ], function (err, newImages) {
    if(err) return res.serverError(err);
    sails.log.debug("[GalleryController.upload] result", newImages);
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
    if(req.param('id')) query.where.id = req.param('id');
    GalleryService.find(query, function (err, images) {
      if (err) return res.serverError(err);
      else res.json(images);
    });
  });
};

/**
 * Find one images of current site and if set, only for certain content
 *
 * @param {!object} req - Request
 * @param {!object} res - responses
 * @param {function} next
 */
var findOne = function (req, res, next) {
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
    if(req.param('id')) query.where.id = req.param('id');
    GalleryService.findOne(query, function (err, image) {
      if (err) return res.serverError(err);
      else res.json(image);
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
  ], function (err, config) {
    if(err) {
      sails.log.error(err);
    }
    // delete file from db even on an error
    Gallery.destroy({id:id, site:config.name}, function (err, result) {
      if(err) {
        return res.serverError(err);
      }
      Gallery.publishDestroy(id);
      res.ok();
    });
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
  findOne: findOne,
  destroy: destroy
};

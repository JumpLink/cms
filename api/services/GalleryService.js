/**
 * 
 */

var easyimg = require('easyimage');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var path = require('path');
var fs = require('fs-extra');
var async = require('async');

var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

/**
 * 
 */
var removeFromFilesystem = function(site, file, callback) {
  var gallery_dirname = path.join(SITES_FOLDER, site, sails.config.paths.gallery);
  file.original.path = path.join(gallery_dirname, file.original.name);
  file.thumb.path = path.join(gallery_dirname, file.thumb.name);
  // sails.log.debug("removeFromFilesystem", site, file);
  fs.remove(file.thumb.path, function(err){
    if (err) return callback(err);
    fs.remove(file.original.path, function(err){
      if (err) return callback(err);
      callback(null);
    });
  });
};

/**
 * Get Image Information for the original Image like width, depth, size, type and etc..
 */
var setInfoForOriginal = function (options, file, callback) {
  // sails.log.debug("[GalleryService.setInfoForOriginal]", "options", options, "file", file);
  if(UtilityService.isUndefined(file) || UtilityService.isUndefined(file.savedTo)) callback(new Error("file.savedTo is undefined"));
  easyimg.info(file.savedTo).then( function(original) {
    delete original.path;
    callback(null, original);
  }, callback); // error
};

/**
 * Get Image Information for the Thumbnail Image like width, depth, size, type and etc..
 */
var setInfoForThumbnail = function (options, file, callback) {
  if(UtilityService.isUndefined(options.thumbnail) || UtilityService.isUndefined(options.thumbnail.dst)) callback();
  easyimg.info(options.thumbnail.dst).then( function(thumb) {
    delete thumb.path;
    callback(null, thumb);
  }, callback); // error
};

/**
 * Get Image Information for the rescrop (resized and cropped) Image like width, depth, size, type and etc..
 */
var setInfoForRescrop = function (options, file, callback) {
  if(UtilityService.isUndefined(options.rescrop) || UtilityService.isUndefined(options.rescrop.dst)) callback();
  easyimg.info(options.rescrop.dst).then( function(rescrop) {
    delete rescrop.path;
    callback(null, rescrop);
  }, callback); // error
};

/**
 * TODO rescrop use async check 
 */
var prepearFileForDatabase = function (options, file, callback) {
  // sails.log.debug("[GalleryService.prepearFileForDatabase]", "\noptions", options, "\nfile", file);
  async.parallel({
    original: function (callback) {
      setInfoForOriginal(options, file, callback);
    },
    thumbnail: function (callback) {
      setInfoForThumbnail(options, file, callback);
    },
    rescrop: function (callback) {
      setInfoForRescrop(options, file, callback);
    }
  },
  function(err, results) {
    if (err) return callback(err);
    file.original = results.original;
    file.thumb = results.thumbnail;
    file.rescrop = results.rescrop;
    // sails.log.debug("[GalleryService.prepearFileForDatabase] done, file:\n", file);
    callback(null, file);
  });
};

/**
 * 
 */
var prepearFilesForDatabase = function (options, files, images, callback) {
  // sails.log.debug("prepearFilesForDatabase", site, files);
  // get max position
  var last_position = UtilityService.max(images, 'position');
  // sails.log.debug("last_position", last_position);
  async.map(files, prepearFileForDatabase.bind(null, options), function(err, files) {
    if(err) callback(err);
    // sails.log.debug("[GalleryService.prepearFilesForDatabase] files successful prepeared\n", files);
    for (var i = files.length - 1; i >= 0; i--) {
      last_position++;
      files[i].position = last_position; // set position
      files[i].site = options.site; // set site for each file
    };
    callback(null, files);
  });
};

/**
 * 
 */
var find = function (query, callback) {
  if(!query.sort) query.sort = 'position';
  Gallery.find(query).exec(function found(err, images) {
    if (err) return callback(err);
    if (UtilityService.isUndefined(images) || !UtilityService.isArray(images)) {
      callback("not found");
    } else {
      images = UtilityService.fixPosition(images);
      callback(null, images);
    }
  });
};

/*
 *  { images: [], content: "", .. } => {"contentname1": {}, "contentname3": {}, ..}
 */
var convertImageArrayToObject = function (images) {
  // sails.log.debug(images);
  var result = {};
  for (var i = images.length - 1; i >= 0; i--) {
    result[images[i].content] = images[i].images;
  };
  return result;
}

/**
 * 
 */
var findForContent = function (content, callback) {
  var query = {
    where: {
      site: content.site,
      content: content.name,
      page: content.page
    }
  };
  find(query, function (err, images) {
    if (err) return callback(err);
    else {
      result = {
        images: images,
        site: content.site,
        content: content.name,
        page: content.page
      }
      callback(null, result);
    }
  });
};

/**
 * 
 */
module.exports = {
  prepearFilesForDatabase: prepearFilesForDatabase
  , removeFromFilesystem: removeFromFilesystem
  , find: find
  , findForContent: findForContent
  , convertImageArrayToObject: convertImageArrayToObject
}

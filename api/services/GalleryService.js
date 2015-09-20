/**
 * 
 */

var easyimg = require('easyimage');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var path = require('path');
var fs = require('fs-extra');
var async = require('async');

/**
 * Set position for each file based on existing files (images)
 */
var setPositions = function (site, files, images, callback) {
  sails.log.debug("[GalleryService.setPositions]", site, files);
  // get max position
  var last_position = UtilityService.max(images, 'position');
  // sails.log.debug("last_position", last_position);
  for (var i = files.length - 1; i >= 0; i--) {
    last_position++;
    files[i].position = last_position; // set position
    files[i].site = site; // set site for each file
  };
  callback(null, files);
};

/**
 * 
 */
var find = function (query, callback) {
  if(!query.sort) query.sort = 'position';
  sails.log.debug("[GalleryService.find]", query);
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
  setPositions: setPositions,
  find: find,
  findForContent: findForContent,
  convertImageArrayToObject: convertImageArrayToObject,
}

/**
 * 
 */

var easyimg = require('easyimage');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var path = require('path');
var fs = require('fs-extra');

var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

/**
 * 
 */
var removeFromFilesystem = function(site, file, cb) {
  var gallery_dirname = path.join(SITES_FOLDER, site, sails.config.paths.gallery);
  file.original.path = path.join(gallery_dirname, file.original.name);
  file.thumb.path = path.join(gallery_dirname, file.thumb.name);
  // sails.log.debug("removeFromFilesystem", site, file);
  fs.remove(file.thumb.path, function(err){
    if (err) return cb(err);
    fs.remove(file.original.path, function(err){
      if (err) return cb(err);
      cb(null);
    });
  });
};

/**
 * 
 */
var prepearFileForDatabase = function (bind, file, cb) {
  //sails.log.debug("prepearFileForDatabase", bind.site, file);
  // get information about thumb
  easyimg.info(path.join(file.dirname, file.thumb)).then(
    function(thumbInfo) {
      delete thumbInfo.path;
      //sails.log.debug(thumbInfo);
      // get information about original
      easyimg.info(file.savedTo).then(
        function(originalInfo) {
          delete originalInfo.path;
          //sails.log.debug(originalInfo);
          cb(null, {original:originalInfo, thumb:thumbInfo, site:bind.site});
        }, function (err) {
          cb(err);
        }
      );
    }, function (err) {
      cb(err);
    }
  );
};

/**
 * 
 */
var prepearFilesForDatabase = function (site, files, images, cb) {
  // sails.log.debug("prepearFilesForDatabase", site, files);
  // get max position
  var last_position = UtilityService.max(images, 'position');
  // sails.log.debug("last_position", last_position);
  async.map(files, prepearFileForDatabase.bind(null, {site:site}), function(err, files) {
    if(err) cb(err);
    for (var i = files.length - 1; i >= 0; i--) {
      last_position++;
      files[i].position = last_position;
    };
    cb(null, files);
  });
};

/**
 * 
 */
var find = function (query, cb) {
  if(!query.sort) query.sort = 'position';
  Gallery.find(query).exec(function found(err, images) {
    if (err) return cb(err);
    if (UtilityService.isUndefined(images) || !UtilityService.isArray(images)) {
      cb("not found");
    } else {
      images = UtilityService.fixPosition(images);
      cb(null, images);
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
var findForContent = function (content, cb) {
  var query = {
    where: {
      site: content.site,
      content: content.name,
      page: content.page
    }
  };
  find(query, function (err, images) {
    if (err) return cb(err);
    else {
      result = {
        images: images,
        site: content.site,
        content: content.name,
        page: content.page
      }
      cb(null, result);
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

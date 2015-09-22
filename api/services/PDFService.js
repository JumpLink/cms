/**
 * PDFService to handle pdf files
 *
 * @module PDFService
 *
 * @requires pdf-image - https://github.com/mooz/node-pdf-image
 * @requires path - https://nodejs.org/api/path.html
 * @requires fs-extra - https://github.com/jprichardson/node-fs-extra
 */
var PDFImage = require("pdf-image").PDFImage;
var path = require('path');
var fs = require('fs-extra');

var generatePreview = function (site, file, options, callback) {
  file.previewName = FileService.getPreviewName(file);
  sails.log.debug(sails.config.paths.public, sails.config.paths.sites, site, options.path, file.uploadedAs);
  if(UtilityService.isUndefined(options.preview.src)) options.preview.src = path.resolve(sails.config.paths.public, sails.config.paths.sites, site, options.path, file.uploadedAs);
  if(UtilityService.isUndefined(options.preview.dst)) options.preview.dst = path.resolve(sails.config.paths.public, sails.config.paths.sites, site, options.preview.path, file.previewName);
  fs.mkdirs(path.dirname(options.preview.dst), function(err) {
    if(err) return callback(err);
    var pdfImage = new PDFImage(options.preview.src);
    pdfImage.convertPage(0).then(function (imagePath) {
      fs.move(imagePath, options.preview.dst, function (err) {
        if (err) return callback(err);
        callback(null, file);
      });
    }, function (err) {
      sails.log.error(err);
      return callback(err, file);
    });
  });}

/**
 * Convert image file for upload.
 * Generate thumbnail, rescrop etc if this is set in options.
 *
 * @alias module:FileService.convertImageIterator
 */
var convertPDFIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  sails.log.debug("[PDFService.convertPDFIterator] options", options, "isImage: "+file.isImage);
  async.series({
    preview: function (callback) {
      generatePreview(site, file, options, callback);
    },
    previewInfo: function (callback) {
      FileService.setImageInfoForPreview(site, options, file, callback);
    },
    thumb: function (callback) {
      FileService.generateThumbnail(site, file, options, callback);
    }
  },
  function(err, results) {
    if (err) return callback(err);
    // sails.log.debug("[PDFService.convertImageIterator] file", file);
    callback(null, file);
  });
}

/**
 * public functions
 */
module.exports = {
  generatePreview: generatePreview,
  convertPDFIterator: convertPDFIterator,
};
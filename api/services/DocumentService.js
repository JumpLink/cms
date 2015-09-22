/**
 * Convert and handle Documents
 *
 * @module DocumentController
 *
 * @requires unoconv2 - https://github.com/HAASLEWER/unoconv2
 * @requires path - https://nodejs.org/api/path.html
 * @requires fs-extra - https://github.com/jprichardson/node-fs-extra
 * @requires async - https://github.com/caolan/async
 */
var unoconv = require('unoconv2');
var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

/**
 *  Convert and handle Documents using Universal Office Converter (unoconv)
 */
var convert = function (filePath, outputFormat, options, callback) {
  unoconv.convert(filePath, outputFormat, null, callback);
};

/**
 * Convert image file for upload.
 * Generate thumbnail, rescrop etc if this is set in options.
 *
 * @alias module:FileService.convertImageIterator
 */
var convertDocumentPreviewIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  sails.log.debug("[DocumentService.convertDocumentPreviewIterator] options", options, "isImage: "+file.isImage);
  
  options.document.src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  options.document.dst = path.join(SITES_FOLDER, site, options.document.path, FileService.getConvertedName(options.document.prefix, file.uploadedAs, "."+options.document.outputFormat));

  async.series({
    convert: function (callback) {
      convert(options.document.src, options.document.outputFormat, options.document, function (err, resultBuffer) {
        if(err) return callback(err);
        fs.writeFile(options.document.dst, resultBuffer, function (err) {
          file[options.document.outputFormat+'Name'] = options.document.dst;
          callback(err, file)
        });
      });
    },
    preview: function (callback) {
      options.preview.src = options.document.dst;
      PDFService.generatePreview(site, file, options, callback);
    },
    previewInfo: function (callback) {
      FileService.setImageInfoForPreview(site, options, file, callback);
    },
    thumb: function (callback) {
      FileService.generateThumbnail(site, file, options, callback);
    }
  },
  function(err, results) {
    if(err) return callback(err);
    sails.log.debug("[DocumentService.convertDocumentPreviewIterator] results", results);
    callback(null, file);
  });
}

/**
 * Public functions
 */
module.exports = {
  convert: convert,
  convertDocumentPreviewIterator: convertDocumentPreviewIterator
};
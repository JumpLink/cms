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
  file.convertName = FileService.getConvertedName(options.convert.prefix, file.uploadedAs, "."+options.convert.outputFormat);
  options.convert.src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  options.convert.dst = path.join(SITES_FOLDER, site, options.convert.path, file.convertName);

  async.series({
    convert: function (callback) {
      convert(options.convert.src, options.convert.outputFormat, options.convert, function (err, resultBuffer) {
        if(err) return callback(err);
        fs.writeFile(options.convert.dst, resultBuffer, function (err) {
          file[options.convert.outputFormat+'Name'] = file.convertName;
          callback(err, file)
        });
      });
    },
    preview: function (callback) {
      options.preview.src = options.convert.dst;
      PDFService.generatePreview(site, file, options, relativePathInSiteFolder, callback);
    },
    previewInfo: function (callback) {
      FileService.setImageInfoForPreview(site, file, options, relativePathInSiteFolder, callback);
    },
    thumb: function (callback) {
      FileService.generateThumbnail(site, file, options, relativePathInSiteFolder, callback);
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
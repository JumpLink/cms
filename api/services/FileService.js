/**
 * FileService
 *
 * @module FileService
 *
 * @requires easyimg - https://github.com/hacksparrow/node-easyimage
 * @requires path - https://nodejs.org/api/path.html
 * @requires fs-extra - https://github.com/jprichardson/node-fs-extra
 * @requires async - https://github.com/caolan/async
 */
var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var SITES_FOLDER = path.resolve(sails.config.paths.public, sails.config.paths.sites);

/**
 * Check if mime type is an image
 *
 * @alias module:FileService.isImage
 */
var isImage = function (mime) {
  return mime.match('image.*') !== null;
}

var isText = function (mime) {
  return mime.match('text.*') !== null;
}

var isVideo = function (mime) {
  return mime.match('video.*') !== null;
}

var isAudio = function (mime) {
  return mime.match('audio.*') !== null;
}

var isApplication = function (mime) {
  return mime.match('application.*') !== null;
}

var isMultipart = function (mime) {
  return mime.match('multipart.*') !== null;
}

var isModel = function (mime) {
  return mime.match('model.*') !== null;
}



/**
 * Microsoft Word
 * @see http://filext.com/faq/office_mime_types.php
 */
var isDoc = function (mime) {
  return mime === 'application/msword';
}

/**
 * Microsoft Word
 * @see http://filext.com/faq/office_mime_types.php
 */
var isDocx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

/**
 * Microsoft Word
 * @see http://filext.com/faq/office_mime_types.php
 */
var isDotx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.template';
}

/**
 * Microsoft Excel
 * @see http://filext.com/faq/office_mime_types.php
 */
var isXls = function (mime) {
  return mime === 'application/vnd.ms-excel';
}

/**
 * Microsoft Excel
 * @see http://filext.com/faq/office_mime_types.php
 */
var isXlsx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
}

/**
 * Microsoft Excel
 * @see http://filext.com/faq/office_mime_types.php
 */
var isXltx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.template';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 */
var isPpt = function (mime) {
  return mime === 'application/vnd.ms-powerpoint';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 */
var isPptx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 */
var isPotx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.presentationml.template';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 */
var isPpsx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.presentationml.slideshow';
}



/**
 * OpenDocument Text
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdt = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.text';
}

/**
 * OpenDocument Text Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOtt = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.text-template';
}

/**
 * HTML Document Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOth = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.text-web';
}

/**
 * OpenDocument Master Document
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdm = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.text-master';
}

/**
 * OpenDocument Drawing
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdg = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.graphics';
}

/**
 * OpenDocument Drawing Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOtg = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.graphics-template';
}

/**
 * OpenDocument Presentation
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdp = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.presentation';
}

/**
 * OpenDocument Presentation Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOtp = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.presentation-template';
}

/**
 * OpenDocument Spreadsheet
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOds = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.spreadsheet';
}

/**
 * OpenDocument Spreadsheet Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOts = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.spreadsheet-template';
}

/**
 * OpenDocument Chart
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdc = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.chart';
}

/**
 * OpenDocument Formula
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdf = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.formula';
}

/**
 * OpenDocument Database
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdb = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.database';
}

/**
 * OpenDocument Image
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdi = function (mime) {
  return mime === 'application/vnd.oasis.opendocument.image';
}

/**
 * OpenOffice.org extension
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOxt = function (mime) {
  return mime === 'application/vnd.openofficeorg.extension';
}




var isMSWord = function (file) {
  return file.isDoc || file.isDot || file.isDocx || file.isDotx;
}

var isMSExcel = function (file) {
  return file.isXls || file.isXlt || file.isXla || file.isXlsx || file.isXltx;
}

var isMSPowerpoint = function (file) {
  return file.isPpt || file.isPot || file.isPps || file.isPpa || file.isPptx || file.isPotx || file.isPpsx;
}

var isOOWriter = function (file) {
  return file.isDdt || file.isOtt;
}

var isOODrawing = function (file) {
  return file.isOdg || file.isOtg;
}

var isOOPresentation = function (file) {
  return file.isOdp || file.isOtp;
}

var isOOSpreadsheet = function (file) {
  return file.isOds || file.isOts;
}



/**
 * Check if mime type is an pdf
 *
 * @alias module:PDFService.isPDF
 */
var isPDF = function (mime) {
  return mime === "application/pdf";
}



var hasTextIcon = function (file) {
  return file.isApplication && file.isDoc;
}

var hasTableIcon = function (file) {
  return file.isApplication && file.isXls;
}

var hasCodeIcon = function (file) {
  return !file.isApplication && file.isText;
}

var hasVideoIcon = function (file) {
  return file.isVideo;
}

var hasApplicationIcon = function (file) {
  return file.isApplication && !file.hasTextIcon && !file.isXls;
}

var hasUnknownIcon = function (file) {
  return !file.hasTextIcon && !file.hasTableIcon && !file.hasCodeIcon && !file.hasVideoIcon && !file.hasApplicationIcon && !file.hasPreview && !file.isPDF
}



var hasConvertToPdfSupport = function (file) {
  return file.isMSWord || file.isMSExcel || file.isMSPowerpoint || file.isOOWriter ||  file.isOODrawing || file.isOOPresentation || file.isOOSpreadsheet;
}

/**
 * Check if file has an preview image
 *
 * @alias module:FileService.hasPreview
 */
var hasPreview = function (file) {
  return (hasConvertToPdfSupport(file) || file.isPDF) && !file.isImage;
}

var parseFileType = function (file) {
  // Base type
  file.isImage = isImage(file.type);
  file.isText = isText(file.type);
  file.isVideo = isVideo(file.type);
  file.isApplication = isApplication(file.type);
  file.isMultipart = isMultipart(file.type);
  file.isModel = isModel(file.type);

  // MS Office
  file.isDocx = isDocx(file.type);
  file.isDotx = isDotx(file.type);
  file.isXls = isXls(file.type);
  file.isXlsx = isXlsx(file.type);
  file.isXltx = isXltx(file.type);
  file.isPpt = isPpt(file.type);
  file.isPptx = isPptx(file.type);
  file.isPotx = isPotx(file.type);
  file.isPpsx = isPpsx(file.type);

  // LibreOffice OpenOffice
  file.isOdt = isOdt(file.type);
  file.isOtt = isOtt(file.type);
  file.isOth = isOth(file.type);
  file.isOdm = isOdm(file.type);
  file.isOdg = isOdg(file.type);
  file.isOtg = isOtg(file.type);
  file.isOdp = isOdp(file.type);
  file.isOtp = isOtp(file.type);
  file.isOds = isOds(file.type);
  file.isOts = isOts(file.type);
  file.isOdc = isOdc(file.type);
  file.isOdf = isOdf(file.type);
  file.isOdb = isOdb(file.type);
  file.isOdi = isOdi(file.type);
  file.isOxt = isOxt(file.type);

  // Groupes
  file.isMSWord = (file.type);
  file.isMSExcel = (file.type);
  file.isMSPowerpoint = (file.type);
  file.isOOWriter = (file.type);
  file.isOODrawing = (file.type);
  file.isOOPresentation = (file.type);
  file.isOOSpreadsheet = (file.type);

  // Other formats
  file.isPDF = isPDF(file.type);

  // Icons
  file.hasTextIcon = hasTextIcon(file);
  file.hasTableIcon = hasTableIcon(file);
  file.hasCodeIcon = hasCodeIcon(file);
  file.hasVideoIcon = hasVideoIcon(file);
  file.hasApplicationIcon = hasApplicationIcon(file);
  file.hasUnknownIcon = hasUnknownIcon(file);

  // supports
  file.hasConvertToPdfSupport = hasConvertToPdfSupport(file);
  file.hasPreview = hasPreview(file);

  return file;
}

var getConvertedName = function (prefix, filename, newExtension) {
  return prefix+path.basename(filename, path.extname(filename))+newExtension;
}

var getPreviewName = function (file) {
  return getConvertedName("preview_", file.uploadedAs, ".png");
}

/**
 * Create square thumbnails.
 *
 * @alias module:FileService.generateThumbnail
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateThumbnail = function (site, file, options, callback) {
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.thumbnail)) return callback();
  var thumbnailOptions = options.thumbnail;
  var src = "";
  if(file.hasPreview) src = getPreviewName(file);
  else src = file.uploadedAs;
  file.thumbName = "thumb_"+src;
  thumbnailOptions.src = path.join(SITES_FOLDER, site, options.path, src);
  thumbnailOptions.dst = path.join(SITES_FOLDER, site, options.thumbnail.path, src);
  // sails.log.debug("[FileService.generateThumbnail] thumbnailOptions", JSON.stringify(thumbnailOptions, null, 2));
  fs.mkdirs(path.dirname(thumbnailOptions.dst), function(err) {
    if(err) {
      sails.log.error(err);
      return callback(err);
    }
    easyimg.thumbnail(thumbnailOptions).then( function(image) {
      // sails.log.debug("[FileService.generateThumbnail] Thumbnail generated", thumbnailOptions.dst);
      file.thumb = image;
      callback(null, file);
    }, function (err) {
      sails.log.error(err);
      callback(err, file);
    });
  });
};

/**
 * Resize and crop and image in one go, useful for creating customzied thumbnails.
 *
 * @alias module:FileService.generateRescrop
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateRescrop = function (site, file, options, callback) {
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.rescrop)) return callback();
  file.rescropName = "rescrop_"+file.uploadedAs;
  var rescropOptions = options.rescrop;
  rescropOptions.src = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  rescropOptions.dst = path.join(SITES_FOLDER, site, options.rescrop.path, file.rescropName);
  // sails.log.debug("[FileService.generateRescrop] rescropOptions", JSON.stringify(rescropOptions, null, 2));
  fs.mkdirs(path.dirname(rescropOptions.dst), function(err) {
    if(err) return callback(err);
    easyimg.rescrop(rescropOptions).then( function(image) {
      // sails.log.debug("[FileService.generateRescrop] rescrop generated", rescropOptions.dst);
      file.rescrop = image;
      callback(null, file);
    }, function (err) {
      callback(err, file);
    });
  });
};

/**
 * Get Image Information for the original Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForOriginal
 */
var setImageInfoForOriginal = function (options, file, callback) {
  // sails.log.debug("[GalleryService.setInfoForOriginal]", "options", options, "file", file);
  if(UtilityService.isUndefined(file) || UtilityService.isUndefined(file.savedTo)) callback(new Error("file.savedTo is undefined"));
  easyimg.info(file.savedTo).then( function(original) {
    delete original.path;
    callback(null, original);
  }, callback); // error
};

/**
 * Get Image Information for the original Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForOriginal
 */
var setImageInfoForPreview = function (site, options, file, callback) {
  // sails.log.debug("[GalleryService.setInfoForOriginal]", "options", options, "file", file);
  if(UtilityService.isUndefined(file) || UtilityService.isUndefined(file.savedTo)) callback(new Error("file.savedTo is undefined"));
  var src = options.preview.dst || path.join(SITES_FOLDER, site, options.path, getPreviewName(file));
  easyimg.info(src).then( function(preview) {
    file.preview = preview;
    delete preview.path;
    callback(null, preview);
  }, callback); // error
};


/**
 * Get Image Information for the Thumbnail Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForThumbnail
 */
var setImageInfoForThumbnail = function (options, file, callback) {
  if(UtilityService.isUndefined(options.thumbnail) || UtilityService.isUndefined(options.thumbnail.dst)) callback();
  easyimg.info(options.thumbnail.dst).then( function(thumb) {
    delete thumb.path;
    callback(null, thumb);
  }, callback); // error
};

/**
 * Get Image Information for the rescrop (resized and cropped) Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForRescrop
 */
var setImageInfoForRescrop = function (options, file, callback) {
  if(UtilityService.isUndefined(options.rescrop) || UtilityService.isUndefined(options.rescrop.dst)) callback();
  easyimg.info(options.rescrop.dst).then( function(rescrop) {
    delete rescrop.path;
    callback(null, rescrop);
  }, callback); // error
};

/**
 * Convert image file for upload.
 * Generate thumbnail, rescrop etc if this is set in options.
 *
 * @alias module:FileService.convertImageIterator
 */
var convertImageIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  sails.log.debug("[FileService.convertImageIterator] options", options, "isImage: "+file.isImage);
  async.series({
    thumb: function (callback) {
      generateThumbnail(site, file, options, callback);
    },
    rescrop: function (callback) {
      generateRescrop(site, file, options, callback);
    },
    originalInfo: function (callback) {
      setImageInfoForOriginal(options, file, callback);
    }
  },
  function(err, results) {
    if (err) return callback(err);
    callback(null, file);
  });
}

/**
 * Convert general file for upload
 *
 * @alias module:FileService.convertFileIterator
 */
var convertFileIterator = function (site, file, relativePathInSiteFolder, options, callback) {
  file = parseFileType(file);
  file.uploadedAs = path.basename(file.fd);
  file.savedTo = path.join(SITES_FOLDER, site, relativePathInSiteFolder, file.uploadedAs);
  file.dirname = path.dirname(file.savedTo);
  sails.log.debug("[FileService.convertFileIterator] options", "file", file);
  async.series([
    function (callback) {
      fs.mkdirs(file.dirname, callback);
    },
    function (callback) {
      fs.move(file.fd, file.savedTo, callback);
    }
  ],
  function(err, results) {
    if(err) return callback(err);
    if(file.isPDF) return PDFService.convertPDFIterator(site, file, relativePathInSiteFolder, options, callback);
    if(file.hasConvertToPdfSupport) return DocumentService.convertDocumentPreviewIterator(site, file, relativePathInSiteFolder, options, callback);
    if(file.isImage) return convertImageIterator(site, file, relativePathInSiteFolder, options, callback);
    sails.log.debug("[FileService.convertFileIterator] finish");
    return callback(null, file);
  });
};

/**
 * Upload files and convert them
 *
 * @alias module:FileService.upload
 */
var upload = function (req, relativePathInSiteFolder, callback) {
  var host = req.session.uri.host;
  var site = null;
  var options = parseFileOptions(req, relativePathInSiteFolder);
  // WORKAROUND for BUG https://github.com/balderdashy/skipper/issues/36
  if(req._fileparser.form.bytesExpected > 10000000) {
    sails.log.error('File exceeds maxSize. Aborting.');
    req.connection.destroy();
    return callback('File exceeds maxSize. Aborting.');
  }

  req.file("file").upload(function (err, files) {
    if (err) {
      sails.log.error(err);
      return callback(err);
    } else {
      MultisiteService.getCurrentSiteConfig(host, function (err, config) {
        if(err) return res.serverError(err);
        site = config.name;
        async.map(files, function (file, callback) {
          convertFileIterator(site, file, relativePathInSiteFolder, options, callback);
        }, function(err, files) {
          if(err) return callback(err);
          var result = {
            message: files.length + ' file(s) uploaded successfully!',
            files: files,
            site: site
          };
          return callback(null, result);
        });
      });
    }
  });
};

/**
 * Upload a file for the gallery and save file in gallery database
 *
 * @alias module:FileService.parseFileOptions
 */
var parseFileOptions = function (req, path) {
  var options = JSON.parse(req.headers.options);
  var defaults = {
    path: path,
    thumbnail: {
      width: 300,
      path: path,
      prefix: 'thumb_'
    },
    rescrop: {
      width: 960 * 3, // width og bootstrap content width * 3 for hidpi
      cropwidth: 960 * 3,
      cropheight: 720 * 3,
      prefix: 'rescrop_'
    },
    preview: {
      path: path,
      prefix: 'preview_'
    },
    document: {
      path: path,
      outputFormat: 'pdf',
      prefix: 'converted_',
    }
  }
  options = UtilityService.extend(true, defaults, options);
  return options;
}

/**
 *
 * @alias module:FileService.removeFromFilesystem
 */
var removeFromFilesystem = function (site, file, relativePathInSiteFolder, callback) {
  var dirname = path.join(SITES_FOLDER, site, relativePathInSiteFolder);
  sails.log.debug("[FileService.removeFromFilesystem]", "dirname", dirname, file);
  async.parallel([
    function removeFile(callback){
      if(UtilityService.isUndefined(file.uploadedAs) || file.uploadedAs === null) return callback();
      var filepath = path.join(dirname, file.uploadedAs);
      return fs.remove(filepath, callback);
    },
    function removeOriginalImage(callback){
      if(UtilityService.isUndefined(file.original) || file.original === null) return callback();
      var filepath = path.join(dirname, file.original.name);
      return fs.remove(filepath, callback);
    },
    function removeThumbnailImage(callback){
      if(UtilityService.isUndefined(file.thumb) || file.thumb === null) return callback();
      var filepath = path.join(dirname, file.thumb.name);
      return fs.remove(filepath, callback);
    },
    function removeThumbnailImage(callback){
      if(UtilityService.isUndefined(file.rescrop) || file.rescrop === null) return callback();
      var filepath = path.join(dirname, file.rescrop.name);
      return fs.remove(filepath, callback);
    },
  ],
  callback);
}

/**
 * Public functions
 */
module.exports = {
  isImage: isImage,
  getConvertedName: getConvertedName,
  hasPreview: hasPreview,
  getPreviewName: getPreviewName,
  generateThumbnail: generateThumbnail,
  setImageInfoForPreview: setImageInfoForPreview,
  convertFileIterator: convertFileIterator,
  upload: upload,
  parseFileOptions: parseFileOptions,
  removeFromFilesystem: removeFromFilesystem,
  deleteFromFilesystem: removeFromFilesystem, // alias
};
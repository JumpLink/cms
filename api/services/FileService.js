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
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isDoc = function (mime) {
  return mime === 'application/msword' || mime === 'application/wps-office.doc' || mime === 'application/wps-office.dot';
}

/**
 * Microsoft Word
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isDocx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mime === 'application/wps-office.docx';
}

/**
 * Microsoft Word
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isDotx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.template' || mime === 'application/wps-office.dotx';
}

/**
 * Microsoft Excel
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isXls = function (mime) {
  return mime === 'application/vnd.ms-excel' || mime === 'application/wps-office.xls';
}

/**
 * Microsoft Excel
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isXlsx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mime === 'application/wps-office.xlsx';
}

/**
 * Microsoft Excel
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isXltx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.template' || mime === 'application/wps-office.xltx';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isPpt = function (mime) {
  return mime === 'application/vnd.ms-powerpoint' || mime === 'application/wps-office.ppt' || mime === 'application/wps-office.pot'  || mime === 'application/wps-office.pps';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isPptx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || mime === 'application/wps-office.pptx';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isPotx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.presentationml.template' || mime === 'application/wps-office.potx';
}

/**
 * Microsoft Powerpoint
 * @see http://filext.com/faq/office_mime_types.php
 * @see https://aur.archlinux.org/packages/wps-office/?comments=all (Comment by westmin)
 */
var isPpsx = function (mime) {
  return mime === 'application/vnd.openxmlformats-officedocument.presentationml.slideshow' || mime === 'application/wps-office.ppsx';
}



/**
 * OpenDocument Text
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdt = function (mime) {
  return (mime === 'application/vnd.oasis.opendocument.text');
}

/**
 * OpenDocument Text Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOtt = function (mime) {
  return (mime === 'application/vnd.oasis.opendocument.text-template');
}

/**
 * HTML Document Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOth = function (mime) {
  return (mime === 'application/vnd.oasis.opendocument.text-web');
}

/**
 * OpenDocument Master Document
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdm = function (mime) {
  return (mime === 'application/vnd.oasis.opendocument.text-master');
}

/**
 * OpenDocument Drawing
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOdg = function (mime) {
  return (mime === 'application/vnd.oasis.opendocument.graphics');
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
  return (mime === 'application/vnd.oasis.opendocument.presentation');
}

/**
 * OpenDocument Presentation Template
 * @see http://www.openoffice.org/framework/documentation/mimetypes/mimetypes.html
 */
var isOtp = function (mime) {
  return (mime === 'application/vnd.oasis.opendocument.presentation-template');
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



/**
 * Check if mime type is an pdf
 *
 * @alias module:PDFService.isPDF
 */
var isPDF = function (mime) {
  return mime === "application/pdf";
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
  return file.isOdt || file.isOtt;
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




var hasTextIcon = function (file) {
  return !file.hasPreview && file.isApplication && file.isDoc;
}

var hasTableIcon = function (file) {
  return !file.hasPreview && file.isApplication && file.isXls;
}

var hasCodeIcon = function (file) {
  return !file.hasPreview && !file.isApplication && file.isText;
}

var hasVideoIcon = function (file) {
  return !file.hasPreview && file.isVideo;
}

var hasApplicationIcon = function (file) {
  return !file.hasPreview && file.isApplication && !file.hasTextIcon && !file.isXls;
}

var hasUnknownIcon = function (file) {
  return !file.hasPreview && !file.isImage && !file.hasTextIcon && !file.hasTableIcon && !file.hasCodeIcon && !file.hasVideoIcon && !file.hasApplicationIcon && !file.hasPreview && !file.isPDF
}


/**
 * Determine what kind of file type file is
 *
 * @alias module:FileService.parseFileType
 */
var parseFileType = function (file) {
  // Base type
  file.isImage = isImage(file.type);
  file.isText = isText(file.type);
  file.isVideo = isVideo(file.type);
  file.isApplication = isApplication(file.type);
  file.isMultipart = isMultipart(file.type);
  file.isModel = isModel(file.type);

  // MS Office
  file.isDoc = isDoc(file.type);
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

 // Other formats
  file.isPDF = isPDF(file.type);

  // Groupes
  file.isMSWord = isMSWord(file);
  file.isMSExcel = isMSExcel(file);
  file.isMSPowerpoint = isMSPowerpoint(file);
  file.isOOWriter = isOOWriter(file);
  file.isOODrawing = isOODrawing(file);
  file.isOOPresentation = isOOPresentation(file);
  file.isOOSpreadsheet = isOOSpreadsheet(file);

  // supports
  file.hasConvertToPdfSupport = hasConvertToPdfSupport(file);
  file.hasPreview = hasPreview(file);

  // Icons
  file.hasTextIcon = hasTextIcon(file);
  file.hasTableIcon = hasTableIcon(file);
  file.hasCodeIcon = hasCodeIcon(file);
  file.hasVideoIcon = hasVideoIcon(file);
  file.hasApplicationIcon = hasApplicationIcon(file);
  file.hasUnknownIcon = hasUnknownIcon(file);

  return file;
}

/**
 * Append prefix and change extension of filename
 */
var getConvertedName = function (prefix, filename, newExtension) {
  return prefix+path.basename(filename, path.extname(filename))+newExtension;
}

/**
 * Get filename fpr preview files
 */
var getPreviewName = function (file) {
  return getConvertedName("preview_", file.uploadedAs, ".png");
}

/**
 * Create square thumbnails.
 *
 * @alias module:FileService.generateThumbnail
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateThumbnail = function (site, file, options, relativePathInSiteFolder, callback) {
  sails.log.debug("[FileService.generateThumbnail]");
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.thumbnail)) return callback();
  var srcFilename = file.hasPreview ? getPreviewName(file) : file.uploadedAs;
  file.thumbName = getConvertedName(options.thumbnail.prefix, file.uploadedAs, ".png");
  options.thumbnail.src = path.join(SITES_FOLDER, site, options.path, srcFilename);
  options.thumbnail.dst = path.join(SITES_FOLDER, site, options.thumbnail.path, file.thumbName);
  // sails.log.debug("[FileService.generateThumbnail] options.thumbnail", JSON.stringify(options.thumbnail, null, 2));
  fs.mkdirs(path.dirname(options.thumbnail.dst), function(err) {
    if(err) return callback(err);
    easyimg.thumbnail(options.thumbnail).then( function(thumb) {
      // sails.log.debug("[FileService.generateThumbnail] Thumbnail generated", options.thumbnail.dst);
      file.thumb = thumb;
      callback(null, file);
    }, callback);
  });
};

/**
 * Resize and crop and image in one go, useful for creating customzied thumbnails.
 *
 * @alias module:FileService.generateRescrop
 * @see https://github.com/hacksparrow/node-easyimage
 */
var generateRescrop = function (site, file, options, relativePathInSiteFolder, callback) {
  sails.log.debug("[FileService.generateRescrop]");
  if(options === null || UtilityService.isUndefined(options) || UtilityService.isUndefined(options.rescrop)) {
    sails.log.warn("rescop options not set");
    return callback();
  }
  var srcFilename = file.hasPreview ? getPreviewName(file) : file.uploadedAs;
  file.rescropName = getConvertedName(options.rescrop.prefix, file.uploadedAs, ".png");
  if(UtilityService.isUndefined(options.rescrop.src)) options.rescrop.src = path.join(SITES_FOLDER, site, options.path, srcFilename);
  if(UtilityService.isUndefined(options.rescrop.dst)) options.rescrop.dst = path.join(SITES_FOLDER, site, options.rescrop.path, file.rescropName);
  sails.log.debug(options.rescrop.dst, options);
  // sails.log.debug("[FileService.generateRescrop] options.rescrop", JSON.stringify(options.rescrop, null, 2));
  fs.mkdirs(path.dirname(options.rescrop.dst), function(err) {
    if(err) return callback(err);
    easyimg.rescrop(options.rescrop).then( function(image) {
      sails.log.debug("[FileService.generateRescrop] rescrop generated", options.rescrop.dst);
      file.rescrop = image;
      callback(null, file);
    }, callback);
  });
};

/**
 * Get Image Information for the original Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForOriginal
 */
var setImageInfoForOriginal = function (site, file , options, relativePathInSiteFolder, callback) {
  sails.log.debug("[FileService.setImageInfoForOriginal]");
  if(UtilityService.isUndefined(file) || UtilityService.isUndefined(file.uploadedAs)) callback(new Error("file.uploadedAs is undefined"));
  var savedTo = path.join(SITES_FOLDER, site, options.path, file.uploadedAs);
  easyimg.info(savedTo).then( function(original) {
    delete original.path;
    file.original = original;
    callback(null, file);
  }, callback); // error
};

/**
 * Get Image Information for the original Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForPreview
 */
var setImageInfoForPreview = function (site, file, options, relativePathInSiteFolder, callback) {
  sails.log.debug("[FileService.setImageInfoForPreview]");
  if(UtilityService.isUndefined(options) || UtilityService.isUndefined(options.preview)) callback(new Error("file.preview is undefined"));
  var savedTo = options.preview.dst || path.join(SITES_FOLDER, site, options.path, getPreviewName(file));
  easyimg.info(savedTo).then( function(preview) {
    delete preview.path;
    file.preview = preview;
    callback(null, file);
  }, callback); // error
};


/**
 * Get Image Information for the Thumbnail Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForThumbnail
 */
var setImageInfoForThumbnail = function (site, file, options, relativePathInSiteFolder, callback) {
  sails.log.debug("[FileService.setImageInfoForThumbnail]");
  if(UtilityService.isUndefined(options.thumbnail) || UtilityService.isUndefined(options.thumbnail.dst)) callback();
  easyimg.info(options.thumbnail.dst).then( function(thumb) {
    delete thumb.path;
    file.thumb = thumb;
    callback(null, file);
  }, callback); // error
};

/**
 * Get Image Information for the rescrop (resized and cropped) Image like width, depth, size, type and etc..
 *
 * @alias module:FileService.setImageInfoForRescrop
 */
var setImageInfoForRescrop = function (site, file, options, relativePathInSiteFolder, callback) {
  sails.log.debug("[FileService.setImageInfoForRescrop]");
  if(UtilityService.isUndefined(options.rescrop) || UtilityService.isUndefined(options.rescrop.dst)) callback();
  easyimg.info(options.rescrop.dst).then( function(rescrop) {
    delete rescrop.path;
    file.rescrop = rescrop;
    callback(null, file);
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
      generateThumbnail(site, file, options, relativePathInSiteFolder, callback);
    },
    rescrop: function (callback) {
      generateRescrop(site, file, options, relativePathInSiteFolder, callback);
    },
    originalInfo: function (callback) {
      setImageInfoForOriginal(site, file , options, relativePathInSiteFolder, callback);
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
  sails.log.debug("[FileService.convertFileIterator]");
  file = parseFileType(file);
  file.uploadedAs = path.basename(file.fd);
  var savedTo = path.join(SITES_FOLDER, site, relativePathInSiteFolder, file.uploadedAs);
  var dirname = path.dirname(savedTo);
  sails.log.debug("[FileService.convertFileIterator] options", "file", file);
  async.series([
    function (callback) {
      fs.mkdirs(dirname, callback);
    },
    function (callback) {
      fs.move(file.fd, savedTo, callback);
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
      path: path,
      width: 960 * 3, // width og bootstrap content width * 3 for hidpi
      cropwidth: 960 * 3,
      cropheight: 720 * 3,
      prefix: 'rescrop_'
    },
    preview: {
      path: path,
      prefix: 'preview_'
    },
    convert: {
      path: path,
      outputFormat: 'pdf',
      prefix: 'convert_',
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
    function removeOriginalFile(callback) {
      var filename = file.uploadedAs;
      if(UtilityService.isDefined(file.originalName)) filename = file.originalName;
      if(UtilityService.isDefined(file.original) && UtilityService.isDefined(file.original.name)) filename = file.original.name;
      if(UtilityService.isUndefined(filename) || filename === null) return callback();
      var filepath = path.join(dirname, filename);
      sails.log.debug("[FileService.removeFromFilesystem.removeOriginalFile]", filepath);
      return fs.remove(filepath, callback);
    },
    function removeThumbnailImage(callback) {
      var filename = file.thumbName;
      if(UtilityService.isDefined(file.thumb)) filename = file.thumb.name;
      if(UtilityService.isUndefined(filename) || filename === null) return callback();
      var filepath = path.join(dirname, filename);
      sails.log.debug("[FileService.removeFromFilesystem.removeThumbnailImage]", filepath);
      return fs.remove(filepath, callback);
    },
    function removeRescropImage(callback) {
      var filename = file.rescropName;
      if(UtilityService.isDefined(file.rescrop)) filename = file.rescrop.name;
      if(UtilityService.isUndefined(filename) || filename === null) return callback();
      var filepath = path.join(dirname, filename);
      sails.log.debug("[FileService.removeFromFilesystem.removeRescropImage]", filepath);
      return fs.remove(filepath, callback);
    },
    function removePreviewImage(callback) {
      var filename = file.previewName;
      if(UtilityService.isDefined(file.preview)) filename = file.preview.name;
      if(UtilityService.isUndefined(filename) || filename === null) return callback();
      var filepath = path.join(dirname, filename);
      sails.log.debug("[FileService.removeFromFilesystem.removePreviewImage]", filepath);
      return fs.remove(filepath, callback);
    },
    function removeConvert(callback) {
      var filename = file.convertName;
      if(UtilityService.isDefined(file.convert)) filename = file.convert.name;
      if(UtilityService.isUndefined(filename) || filename === null) return callback();
      var filepath = path.join(dirname, filename);
      sails.log.debug("[FileService.removeFromFilesystem.removeConvert]", filepath);
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
/**
 * 
 */

/**
 * Export all contents for any host.
 * Only for superadmins!
 */
var exportByHost = function (host, options, callback) {
  find(host, {}, function (err, contents) {
    if (err) {
      return callback(err);
    }
    routes = ImportExportService.cleanup(contents, options);
    return callback(null, contents);
  });
};

/**
 * 
 */
var findOne = function (host, query, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { return callback(err); }
    if(UtilityService.isUndefined(query)) query = {};
    if(UtilityService.isUndefined(query.where)) query.where = {};
    if(UtilityService.isUndefined(query.where.site)) query.where.site = config.name;

    Content.findOne(query).exec(function (err, found) {
      if (err) return callback(err);
      // not found
      if (UtilityService.isUndefined(found)) {
        return callback("not found");
      }
      callback(null, found, config);
    });
  });
};

/**
 * 
 */
var find = function (host, query, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) { return callback(err); }
    if(UtilityService.isUndefined(query)) query = {};
    if(UtilityService.isUndefined(query.where)) query.where = {};
    if(UtilityService.isUndefined(query.where.site)) query.where.site = config.name;
    if(UtilityService.isUndefined(query.sort)) query.sort = 'position';

    Content.find(query).exec(function (err, found) {
      if (err) return callback(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) return callback("not found");
      callback(null, found, config);
    });
  });
};

/**
 * 
 */
var updateOrCreate = function(host, content, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) callback(err);
    content.site = config.name;
    var query = {
      id: content.id,
      site: content.site
    };
    // modelName, data, query, callback, extendFound
    ModelService.updateOrCreate('Content', content, query, callback);
  });
};

/**
 * 
 */
var updateOrCreateByHostByTitleAndPage = function(host, content, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) callback(err);
    content.site = config.name;
    var query = {
      title: content.title,
      page: content.page,
    };
    // modelName, data, query, callback, extendFound
    ModelService.updateOrCreate('Content', content, query, callback);
  });
};

/*
 * get all contents for page including images for each content.name 
 */
var resolveAllWithImage = function(page, site, type, cb) {
  var query = {
    where: {
      page: page,
      site: site
    },
    sort: 'position'
  };

  if(type) {
    query.where.type = type;
  }

  // sails.log.debug("query", query)
  Content.find(query).exec(function found (err, contents) {
    if (err) return cb(err);
    // TODO maybe remove this and make shure the positions are okay on client site
    contents = UtilityService.fixPosition(contents);

    async.map(contents, GalleryService.findForContent, function(err, imagesForEachContent) {
      if (err) return cb(err);
      imagesForEachContent = GalleryService.convertImageArrayToObject(imagesForEachContent);
      cb(null, {contents:contents, images:imagesForEachContent});
    });
  });
};

/**
 * 
 */
module.exports = {
  exportByHost: exportByHost,
  findOne: findOne,
  find: find,
  updateOrCreate: updateOrCreate,
  updateOrCreateByHostByTitleAndPage: updateOrCreateByHostByTitleAndPage,
  resolveAllWithImage: resolveAllWithImage,
};
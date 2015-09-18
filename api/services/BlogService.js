/**
 *
 */

/**
 * Find Blog posts for the current site and if set of the page
 */
var find = function (host, page, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) return callback(err, {code: 500, error: err});
    var query = {
      where: {
        site: config.name
      }
    };
    if(page !== null && UtilityService.isDefined(page)) query.where.page = page;
    Blog.find(query).exec(function found(err, found) {
      if (err) return callback("Internal Server Error", {code: 500, error: err}, found, config);
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) return callback("Not Found", {code: 404}, found, config);
      return callback(null, {code: 200}, found, config);
    });
  });
}

/**
 * Find one blog post for the current site and if set of the page
 */
var findOne = function (host, id, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) return callback(err, {code: 500, error: err});
    var query = {
      where: {
        site: config.name
      }
    };
    if(id !== null && UtilityService.isUndefined(id)) query.where.id = id;
    Blog.findOne(query).exec(function found(err, found) {
      if (err) return callback("Internal Server Error", {code: 500, error: err}, found, config);
      if (UtilityService.isUndefined(found)) return callback("Not Found", {code: 404}, found, config);
      return callback(null, {code: 200}, found, config);
    });
  });
}

/**
 * 
 */
var findAttachmentInPost = function (host, id, attachmentUploadedAs, callback) {
  var found = false;
  findOne(host, id, function (err, status, result, config) {
    sails.log.debug("[BlogService.findAttachmentInPost]", err, status, result);
    if(err || status.code !== 200 || !UtilityService.isArray(result.attachments)) return callback(err, status, found);
    for (var i = 0; i < result.attachments.length && !found; i++) {
      if(result.attachments[i].uploadedAs === attachmentUploadedAs) {
        found = true;
        return callback(null, status, found, result.attachments[i], i, config);
      }
    };
    return callback(null, status, found, null, null, config);
  });
}

/**
 * public functions
 */
module.exports = {
  find: find,
  findAll: find,
  findOne: findOne,
  findAttachmentInPost: findAttachmentInPost,
}
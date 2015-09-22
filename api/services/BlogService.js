/**
 * BlogService to handle blog posts
 *
 * @module BlogService
 */

/**
 * Find Blog posts for the current site and if set of the page.
 *
 * @param {string} host - The current host on the current request to get the site config
 * @param {string} page - The page identifier the blog post is saved on
 * @param {BlockDBCallback} callback - The callback that handles the database response.
 *
 * @alias module:BlogService.find
 * @alias module:BlogService.findAll
 */
var find = function (host, page, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) return callback(err, null, {code: 500, error: err}, config);
    var query = {
      where: {
        site: config.name
      },
      sort: 'createdAt DESC'
    };
    if(page !== null && UtilityService.isDefined(page)) query.where.page = page;
    Blog.find(query).exec(function found(err, found) {
      if (err) return callback("Internal Server Error", {code: 500, error: err}, found, config);
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) return callback("Not Found", {code: 404}, found, config);
      return callback(null, found, {code: 200}, config);
    });
  });
}

/**
 * Find one blog post for the current site and with id
 *
 * @param {string} host - The current host on the current request to get the site config
 * @param {number} id - The id of the blog post to find
 * @param {BlockDBCallback} callback - The callback that handles the database response.
 *
 * @alias module:BlogService.findOne
 */
var findOne = function (host, id, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, config) {
    if(err) return callback(err, null, {code: 500, error: err});
    var query = {
      where: {
        site: config.name
      }
    };
    if(id !== null && UtilityService.isUndefined(id)) query.where.id = id;
    Blog.findOne(query).exec(function (err, result) {
      if (err) return callback("Internal Server Error", result, {code: 500, error: err}, config);
      if (UtilityService.isUndefined(result)) return callback("Not Found", result, {code: 404}, config);
      return callback(null, result, {code: 200}, config);
    });
  });
}

/**
 * The Callback that handle the find results of blog posts
 * @callback {(number|string)} BlockDBCallback
 * @param {?string} err - Error message string, if no error err is null
 * @param {object|array} result - The Database result, can be an array of results or one result
 * @param {object} status - The request state, contains the HTTP-Statuscode as code
 * @param {object} config - The current site config
 */

/**
 * Find an attachment in post with post-id and attachmentUploadedAs string
 * @param {string} host - The current host on the current request to get the site config
 * @param {number} id - The id of the blog post to find the attachment in
 * @param {string} attachmentUploadedAs - The uploadedAs string of the attachment to find
 * @param {BlockFindAttachmentCallback} callback - The callback that handles the result.
 *
 * @alias module:BlogService.findAttachmentInPost
 */
var findAttachmentInPost = function (host, id, attachmentUploadedAs, callback) {
  var found = false;
  findOne(host, id, function (err, result, status, config) {
    sails.log.debug("[BlogService.findAttachmentInPost]", err, status, result);
    if(err || status.code !== 200 || !UtilityService.isArray(result.attachments)) return callback(err, status, found);
    for (var i = 0; i < result.attachments.length && !found; i++) {
      if(result.attachments[i].uploadedAs === attachmentUploadedAs) {
        found = true;
        return callback(null, i, result.attachments[i], status, config);
      }
    };
    return callback(null, -1, null, status, config);
  });
}

/**
 * The Callback to handles the result of found (or not found) attachment
 * @callback BlockFindAttachmentCallback
 * @param {?string} err - Error message string, if no error err is null
 * @param {(object|object[])} index - The index of the attachment, if no attachment was found, index is -1
 * @param {object} status - Statuscode of the findOne result
 * @param {object} config - The current site config
 */

/**
 * public functions
 */
module.exports = {
  find: find,
  findAll: find, // alias
  findOne: findOne,
  findAttachmentInPost: findAttachmentInPost,
}
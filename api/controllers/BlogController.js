/**
 * BlogController
 *
 * @description :: Server-side logic for managing Blogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * Setup Blog Posts
 */
var setup = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    SetupService.generateBlog(config.name, function(err, result) {
      if(err) { return res.serverError(err); }
      res.json(result);
    });
  });
};

/**
 * Create a Blog Post
 */
var create = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var data = req.params.all();
    data.site = config.name;
    Blog.create(data).exec(function create(err, created){
      // Blog.publisCreate(created[0].id, created[0]);
      sails.log.info("created", created);
      res.json(created);
    });
  });
};

/**
 * Update a Blog Post
 */
var update = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var id = req.param('id');
    var data = req.params.all();
    data.site = config.name;
    Blog.update({id:id, site:config.name},data).exec(function update(err, updated){
      // Blog.publishUpdate(updated[0].id, updated[0]);
      sails.log.info("updated", updated);
      res.json(updated);
    });
  });
};

/**
 * Upload a file for a Blog Post
 */
var upload = function (req, res) {
  FileService.upload(req, sails.config.paths.blog, function (err, result) {
    if(err) return res.serverError(err);
    else res.json(result);
  });
};

/**
 * Find Blog posts for the current site and if set of the page
 */
var find = function (req, res) {
  var page = req.param('page');
  BlogService.find(req.session.uri.host, page, function (err, status, results) {
    if(err) return res.serverError(err);
    sails.log.debug("[BlogController.find]", status, result);
    switch(status.code) {
      case 200: return res.json(results);
      case 400: return res.badRequest();
      case 403: return res.forbidden();
      case 404: return res.notFound();
      case 500: return res.serverError(status.error);
      default: return res.serverError("Unknown Error");
    }
  });
}

/**
 *  Destroy / delete a Blog Post by id
 */
var destroy = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) return res.serverError(err);
    var id = req.param('id');
    var site = config.name;
    // TODO delete all attachments!!
    Blog.destroy({id:id, site:site}).exec(function create(err, destroyed){
      // Blog.publisCreate(destroyed[0].id, destroyed[0]);
      sails.log.info("destroyed", destroyed);
      res.json(destroyed);
    });
  });
};

/**
 * delete attachment found by blog post id and attachmentUploadedAs string
 */
var deleteAttachment = function (req, res, next) {
  var id = req.param('blogPostID') || req.param('id');
  var attachmentUploadedAs = req.param('attachmentUploadedAs');
  sails.log.debug("BlogController.deleteAttachment", id, attachmentUploadedAs);
  BlogService.findAttachmentInPost(req.session.uri.host, id, attachmentUploadedAs, function (err, status, found, attachment, index, config) {
    if(err || status.code !== 200) {
      sails.log.error(status);
      return res.serverError(err);
    }
    if(!found) {
      sails.log.warn("Attachment not found");
      return res.ok();
    }
    sails.log.debug("[BlogController.deleteAttachment] Found attachment", attachment)
    FileService.removeFromFilesystem(config.name, attachment, sails.config.paths.blog, function (err) {
      if(err) { return res.serverError(err); }
      return res.ok();
    });
  });
  
}

/**
 * public functions
 */
module.exports = {
  setup: setup,
  create: create,
  update: update,
  upload: upload,
  find: find,
  findAll: find, // alias
  destroy: destroy,
  deleteAttachment: deleteAttachment,
  removeAttachment: deleteAttachment, // alias
}
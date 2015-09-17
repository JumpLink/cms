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
 * Find Blog posts for the current site
 */
var find = function (req, res) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var query = {
      where: {
        site: config.name
      }
    };

    Blog.find(query).exec(function found(err, found) {
      if (err) return res.serverError(err);
      // not found
      if (UtilityService.isUndefined(found) || !UtilityService.isArray(found)) {
        res.notFound(query.where);
      } else {
        // sails.log.debug("found", found);
        res.json(found);
      }
    });
  });
}

/**
 *  Destroy / delete a Blog Post by id
 */
var destroy = function (req, res, next) {
  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { return res.serverError(err); }
    var id = req.param('id');
    var site = config.name;
    Blog.destroy({id:id, site:site}).exec(function create(err, destroyed){
      // Blog.publisCreate(destroyed[0].id, destroyed[0]);
      sails.log.info("destroyed", destroyed);
      res.json(destroyed);
    });
  });
};

/**
 *
 */
var deleteAttachment = function (req, res, next) {
  return res.json("TODO");
}

/**
 * 
 */
module.exports = {
  setup: setup,
  create: create,
  update: update,
  upload: upload,
  find: find,
  findAll: find, // Alias
  destroy: destroy,
  deleteAttachment: deleteAttachment
}
/**
 * MagentoController
 *
 * @description :: Server-side logic for managing magento
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

/**
 * 
 */
var catalog_product_list = function (req, res, next) {

  sails.log.debug("magento/catalog_product_list");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var magento = require('magento')(config.magento);
    var sku = req.param('id') || req.param('sku');
    var storeview = req.param('storeview') || null;// "shop_de";
    var filter = magento.xmlrpc.auto.set_filter.like_sku(sku);
    sails.log.debug(filter);

    magento.xmlrpc.manual.init(function(err) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      magento.xmlrpc.auto.catalog.product.list(filter, storeview, function (err, result) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        sails.log.debug(result);
        res.json(result);
      });
    });
  });
};

/**
 * 
 */
var catalog_product_attribute_media_list = function (req, res, next) {

  sails.log.debug("magento/catalog_product_attribute_media_list");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var magento = require('magento')(config.magento);
    var id = req.param('id');
    var storeview = req.param('storeview') || null;// "shop_de";
    //var data = req.params.all();
    sails.log.debug(id, storeview);

    magento.xmlrpc.manual.init(function(err) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      magento.xmlrpc.auto.catalog.product.attribute.media.list(id, storeview, function (err, result) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        sails.log.debug(result);
        res.json(result);
      });
    });
  });
};

/**
 * 
 */
var catalog_product_info = function (req, res, next) {

  sails.log.debug("magento/catalog_product_info");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var magento = require('magento')(config.magento);
    var id = req.param('id');
    var storeview = req.param('storeview') || null;// "shop_de";
    //var data = req.params.all();
    sails.log.debug(id, storeview);

    magento.xmlrpc.manual.init(function(err) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      magento.xmlrpc.auto.catalog.product.info(id, storeview, function (err, result) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        sails.log.debug(result);
        res.json(result);
      });
    });
  });
};

/**
 * 
 */
var catalog_product_update = function (req, res, next) {

  sails.log.debug("magento/catalog_product_update");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var magento = require('magento')(config.magento);
    var data = req.params.all();
    var productData = data.product;
    var product_id_or_sku = data.id || data.sku;
    var storeView = data.storeview || null;// "shop_de";
    sails.log.debug(product_id_or_sku, storeView, productData);

    magento.xmlrpc.manual.init(function(err) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      magento.xmlrpc.auto.catalog.product.update(product_id_or_sku, productData, storeView, function (err, result) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        sails.log.debug(result);
        res.json(result);
      });
    });
  });
};

/**
 * 
 */
var catalog_product_stock_list = function (req, res, next) {

  sails.log.debug("magento/catalog_product_stock_list");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var magento = require('magento')(config.magento);
    var id = req.param('id');
    //var data = req.params.all();
    sails.log.debug(id);

    magento.xmlrpc.manual.init(function(err) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      magento.xmlrpc.auto.catalog.product.stock.list(id, function (err, result) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        sails.log.debug(result);
        res.json(result);
      });
    });
  });
};

/**
 * 
 */
var catalog_product_stock_update = function (req, res, next) {

  sails.log.debug("magento/catalog_product_stock_update");

  MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
    if(err) { sails.log.error(err); return res.serverError(err); }
    var magento = require('magento')(config.magento);
    var data = req.params.all();
    sails.log.debug(data);

    if(typeof data.product === 'undefined') { sails.log.error("data.product is 'undefined'"); return res.serverError("data.product is 'undefined'"); }
    if(typeof data.id === 'undefined') { sails.log.error("data.id is 'undefined'"); return res.serverError("data.id is 'undefined'"); }

    magento.xmlrpc.manual.init(function(err) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      magento.xmlrpc.auto.catalog.product.stock.update(data.id, data.product, function (err, result) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        sails.log.debug(result);
        res.json(result);
      });
    });
  });
};

/**
 * 
 */
module.exports = {
  catalog_product_list: catalog_product_list,
  catalog_product_attribute_media_list: catalog_product_attribute_media_list,
  catalog_product_info: catalog_product_info,
  catalog_product_update: catalog_product_update,
  catalog_product_stock_list: catalog_product_stock_list,
  catalog_product_stock_update: catalog_product_stock_update
};


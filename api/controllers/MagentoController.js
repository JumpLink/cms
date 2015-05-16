/**
 * MultisiteController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {


  find: function (req, res, next) {

    sails.log.debug("magento/find");

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
  },

  findImage: function (req, res, next) {

    sails.log.debug("magento/findImage");

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
  },

  findInfo: function (req, res, next) {

    sails.log.debug("magento/findInfo");

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
  },

  catalog_product_stock_list: function (req, res, next) {

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
  },

  catalog_product_stock_update: function (req, res, next) {

    sails.log.debug("magento/catalog_product_stock_update");

    MultisiteService.getCurrentSiteConfig(req.session.uri.host, function (err, config) {
      if(err) { sails.log.error(err); return res.serverError(err); }
      var magento = require('magento')(config.magento);
      var data = req.params.all();
      sails.log.debug(data);

      magento.xmlrpc.manual.init(function(err) {
        if(err) { sails.log.error(err); return res.serverError(err); }
        magento.xmlrpc.auto.catalog.product.stock.update(data.id, data, function (err, result) {
          if(err) { sails.log.error(err); return res.serverError(err); }
          sails.log.debug(result);
          res.json(result);
        });
      });
    });
  },

};


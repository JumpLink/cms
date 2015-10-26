var cleanup = function (objectArray, toRemoveOptions) {
  for (var i = 0; i < objectArray.length; i++) {
    if(toRemoveOptions.id === true) {
      delete objectArray[i].id;
    }
    if(toRemoveOptions.site === true) {
      delete objectArray[i].site;
    }
  }
  return objectArray;
};

var importByHost = function (modelName, host, data, options, callback) {
  MultisiteService.getCurrentSiteConfig(host, function (err, siteConfig) {
    if(err) return callback(err);
    async.waterfall([
      function destroyAll(callback){
        sails.log.debug("[ExportImportService.importByHost.destroyAll]");
        global[modelName].destroy({site:siteConfig.name}, function (error, destroyed) {
          sails.log.debug(destroyed);
          callback(error);
        });
      },
      function prepair (callback){
        sails.log.debug("[ExportImportService.importByHost.prepair]");
        data = UtilityService.setPropertyForEach(data, 'site', siteConfig.name);
        callback(null, data);
      },
      function createNewSetup (data, callback){
        sails.log.debug("[ExportImportService.importByHost.createNewSetup]");
        async.map(data, global[modelName].create, callback);
      },
    ], callback);
  });
};

/**
 * public functions
 */
module.exports = {
  cleanup: cleanup,
  importByHost: importByHost,
};
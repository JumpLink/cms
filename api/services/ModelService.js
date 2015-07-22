/**
 * 
 */

var extend = require('node.extend');

/**
 * 
 */
var updateOrCreate = function (modelName, data, query, callback, extendFound) {
  // sails.log.debug("updateOrCreate", modelName, data);
  // sails.log.debug("global[modelName]", global[modelName]);

  if (typeof query == 'undefined') {
    return callback('ModelService: No query provided.');
  }
  if (!data) {
    return callback('ModelService: No data provided.');
  }

  // Otherwise, find and destroy the global[modelName] in question
  global[modelName].findOne(query).exec(function found(err, found) {
    if (err) {
      sails.log.error("ModelService: Error on findOne on updateOrCreate:", err);
      return callback(err);
    }
    if (found instanceof Array) found = found[0];
    // not found
    if (UtilityService.isUndefined(found) || UtilityService.isUndefined(found.id) || found.id === null) {
      global[modelName].create(data).exec(function created (err, data) {
        if (err) {
          sails.log.error("ModelService: Error on create on updateOrCreate:", err);
          return callback(err);
        } else {
          // sails.log.debug("created", err, data);
          global[modelName].publishCreate(data);
          callback(null, data);
        }
      });
    } else {
      data.id = found.id;
      // sails.log.debug("found", found);
      if(extendFound) {
        // sails.log.debug("found", found);
        // sails.log.debug("data", data);
        data = extend(found, data);
        // sails.log.debug("extended", data);
      }

      global[modelName].update(data.id, data).exec(function updated (err, data) {
        if (err) return callback(err);
        if (data instanceof Array) data = data[0];
        // sails.log.debug("update", err, data);
        global[modelName].publishUpdate(data.id, data);
        callback(null, data);
      });
    }
  });
}

var replace = function (modelName, data, callback) {

  if (!data) {
    return callback('ModelService: No data provided.');
  }

  global[modelName].destroy({}).exec(function destroyed (err, destroyResult) {
    if (err) return callback(err);
    global[modelName].create(data).exec(function created (err, data) {
      if (err) return callback(err);
      global[modelName].publishCreate(data);
      return callback(null, data);
    });
  });
}

var updateEach = function (modelName, datas, callback) {
  if (!datas) {
    return callback('ModelService: No data provided.');
  }
  var iterator = function (data, callback) {
    if (!data.id) {
      return callback('ModelService: No data provided.');
    }
    global[modelName].update(data.id, data).exec(function updated (err, data) {
      if (err) return callback(err);
      if (data instanceof Array) data = data[0];
      global[modelName].publishUpdate(data.id, data);
      return callback(null, data);
    });
  }
  async.map(datas, iterator, callback);
}

var updateOrCreateEach = function (modelName, datas, propertyNames, callback, extendFound) {
  if (!modelName) {
    return callback('ModelService: No model name provided.');
  }
  if (!datas) {
    return callback('ModelService: No data provided.');
  }
  if (!propertyNames) {
    return callback('ModelService: No property names provided.');
  }
  if (!Array.isArray(propertyNames)) {
    return callback('ModelService: "propertyNames" is not an array.');
  }
  var iterator = function (data, callback) {
    var query = {};
    for (var i = propertyNames.length - 1; i >= 0; i--) {
      query[propertyNames[i]] = data[propertyNames[i]];
    };
    updateOrCreate(modelName, data, query, callback, extendFound)
  }
  async.mapSeries(datas, iterator, callback);
}

module.exports = {
  updateOrCreate: updateOrCreate,
  replace: replace,
  updateEach: updateEach,
  updateOrCreateEach: updateOrCreateEach
}
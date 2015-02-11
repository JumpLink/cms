var extend = require('node.extend');

var updateOrCreateResponse = function (modelName, findBy, req, res, next) {

  // Locate and validate name parameter
  var query = {};
  query[findBy] = req.param(findBy);
  var data = req.params.all();
  if (!findBy) {
    return res.badRequest('No findBy provided.', findBy);
  }

  updateOrCreate(modelName, data, query, function (err, result) {
     if (err) return res.serverError(err);
     res.status(201);
     return res.json(result.toJson());
  });

}

var updateOrCreate = function (modelName, data, query, callback, extendFound) {
  // sails.log.debug("updateOrCreate", modelName, data, id);
  // sails.log.debug("global[modelName]", global[modelName]);

  if (typeof query == 'undefined') {
    return callback('No query provided.');
  }
  if (!data) {
    return callback('No data provided.');
  }

  // Otherwise, find and destroy the global[modelName] in question
  global[modelName].find(query).exec(function found(err, found) {
    if (err) return callback(err);
    if (found instanceof Array) found = found[0];
    // not found
    if (!found) {
      global[modelName].create(data).exec(function created (err, data) {
        if (err) return callback(err);
        // sails.log.debug("created", err, data);
        global[modelName].publishCreate(data);
        return callback(null, data);
      });
    } else {
      // sails.log.debug("found", found);
      if(extendFound) {
        sails.log.error("found", found);
        sails.log.error("data", data);
        data = extend(found, data);
        sails.log.error("extended", data);
      }

      global[modelName].update(found.id, data).exec(function updated (err, data) {
        if (err) return callback(err);
        if (data instanceof Array) data = data[0];
        // sails.log.debug("update", err, data);
        global[modelName].publishUpdate(found.id, data);
        return callback(null, data);
      });
    }
  });
}

var replace = function (modelName, data, callback) {

  if (!data) {
    return callback('No data provided.');
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
    return callback('No data provided.');
  }
  var iterator = function (data, callback) {
    if (!data.id) {
      return callback('No data provided.');
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

// var updateOrCreateEach = function(modelName, datas, findBy, callback, extendFound) {
//   var iterator =  function (data, cb) {
//     var query = {};
//     query[findBy] = data[findBy];
//     updateOrCreate(modelName, data, query, cb, extendFound);
//   }
//   async.each(datas, iterator, callback);
// }

var updateOrCreateEach = function (modelName, datas, propertyName, callback, extendFound) {
  if (!modelName) {
    return callback('No model name provided.');
  }
  if (!datas) {
    return callback('No data provided.');
  }
  if (!propertyName) {
    return callback('No property name provided.');
  }
  var iterator = function (data, callback) {
    var query = {};
    query[propertyName] = data[propertyName];
    updateOrCreate(modelName, data, query, callback, extendFound)
  }
  async.mapSeries(datas, iterator, callback);
}

module.exports = {
  updateOrCreate: updateOrCreate,
  updateOrCreateResponse: updateOrCreateResponse,
  replace: replace,
  updateEach: updateEach,
  updateOrCreateEach: updateOrCreateEach
}
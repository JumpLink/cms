/**
 * A collection of useful help functions.
 */
var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
var path = require('path');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var extend = require('node.extend'); // https://github.com/dreamerslab/node.extend

var UlilityService = {};

/**
 * Merge the contents of two or more objects together into the first object.
 *
 * @see https://github.com/dreamerslab/node.extend
 */
UlilityService.extend = extend;

/**
 * check whether a value is a number
 *
 * @see http://stackoverflow.com/questions/6449611/how-to-check-whether-a-value-is-a-number-in-javascript-or-jquery
 */
UlilityService.isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Finding the max value of an attribute in an array of objects.
 *
 * @see http://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
 */
UlilityService.max = function (array, key) {
  return Math.max.apply(Math,array.map(function(o) {
    if(UlilityService.isNumber) {
      return o[key];
    }
    else {
      return 0;
    }
  }));
};

/**
 * 
 */
UlilityService.isDefined = function(value) {
  return !underscore.isUndefined(value);
};

/**
 * 
 */
UlilityService.isUndefined = underscore.isUndefined;

/**
 * 
 */
UlilityService.isFunction = underscore.isFunction;

/**
 * 
 */
UlilityService.isArray = underscore.isArray;

/**
 * 
 */
UlilityService.isString = underscore.isString;

/**
 * Server compatibility filter to angular.
 * Returns a (stably) sorted copy of list, ranked in ascending order by the results of running each value through iteratee.
 * Iteratee may also be the string name of the property to sort by (eg. length).
 *
 * @see http://underscorejs.org/#sortBy
 */
UlilityService.$filter = function(filtername) {
  switch (filtername) {
    case 'orderBy':
      return underscore.sortBy;
    case 'where':
      return underscore.where;
    default:
      return underscore.where;
  }
};

/**
 * @see http://underscorejs.org/#where
 */
UlilityService.where = underscore.where;

/**
 * Invert the order of an array
 */
UlilityService.invertOrder = function (array) {
  var result = [];
  for (var i = array.length - 1; i >= 0; i--) {
    result.push(array[i]);
  }
  return result;
};

/**
 * Get an array of dirs in path.
 *
 * @see: http://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
 */
UlilityService.getDirsSync = function (srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};

/**
 * Async version of getDirsSync
 * 
 * @see: UlilityService.getDirsSync
 */
UlilityService.getDirs = function(srcpath, cb) {
  fs.readdir(srcpath, function (err, files) {
    if(err) { 
      console.error(err);
      return cb([]);
    }
    var iterator = function (file, cb)  {
      fs.stat(path.join(srcpath, file), function (err, stats) {
        if(err) { 
          console.error(err);
          return cb(false);
        }
        cb(stats.isDirectory());
      });
    };
    async.filter(files, iterator, cb);
  });
};

/**
 * Sort an array by property 
 *
 * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
UlilityService.sortArrayByProperty = function(array, propertyName, inverse) {
  var sorter = null;
  if (inverse) {
    sorter = function (a, b) {
      if (a[propertyName] > b[propertyName] ) {
        return 1;
      }
      if (a[propertyName]  < b[propertyName] ) {
        return -1;
      }
      // a must be equal to b
      return 0;
    };
  } else {
    sorter = function (a, b) {
      if (a[propertyName] < b[propertyName] ) {
        return 1;
      }
      if (a[propertyName]  > b[propertyName] ) {
        return -1;
      }
      // a must be equal to b
      return 0;
    };
  }
  
  array.sort(sorter);
  return array;
};

/**
 * Set the same property value for each element in values.
 * Useful to set the sitename for each element.
 *
 * Example:
 *     users = UtilityService.setPropertyForEach(users, 'site', siteName);
 * 
 * @param {array} values Array of objects
 */
UlilityService.setPropertyForEach = function (values, propertyName, value) {
  for (var i = values.length - 1; i >= 0; i--) {
    values[i][propertyName] = value;
  }
  return values;
};

/**
 * This functions sets a position property identical with the current array index.
 * Useful for objects they requiring a position property.
 */
UlilityService.fixPosition = function (obj) {
  for (var i = 0; i < obj.length; i++) {
      obj[i].position = i+1;
  }
  return obj;
};


UlilityService.isFile = function (filepath, cb) {
  if(!UlilityService.isString(filepath)) {
    return cb('filepath is not a string!');
  }
  fs.lstat(filepath, function (err, stats) {
    if(err) {
      return cb(err);
    }
    // sails.log.debug("[UlilityService.isFile]", stats);
    cb(null, stats.isFile());
  });
};

/**
 * The following functions are public.
 */
module.exports = UlilityService;

/**
 * A collection of useful help functions.
 */
var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
var path = require('path');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/
var extend = require('node.extend'); // https://github.com/dreamerslab/node.extend


/**
 * check whether a value is a number
 *
 * @see http://stackoverflow.com/questions/6449611/how-to-check-whether-a-value-is-a-number-in-javascript-or-jquery
 */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Finding the max value of an attribute in an array of objects.
 *
 * @see http://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
 */
var max = function (array, key) {
  return Math.max.apply(Math,array.map(function(o){ if(isNumber) return o[key]; else 0}))
};

/**
 * 
 */
var isDefined = function(value) {
  return !underscore.isUndefined(value);
};

/**
 * Server compatibility filter to angular.
 * Returns a (stably) sorted copy of list, ranked in ascending order by the results of running each value through iteratee.
 * Iteratee may also be the string name of the property to sort by (eg. length).
 *
 * @see http://underscorejs.org/#sortBy
 */
var $filter = function(filtername) {
  switch (filtername) {
    case 'orderBy':
      return underscore.sortBy;
    break;
  }
};

/**
 * Invert the order of an array
 */
var invertOrder = function (array) {
  var result = [];
  for (var i = array.length - 1; i >= 0; i--) {
    result.push(array[i]);
  };
  return result;
}

/**
 * Get an array of dirs in path.
 *
 * @see: http://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
 */
var getDirsSync = function (srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
};

/**
 * Async version of getDirsSync
 * 
 * @see: UlilityService.getDirsSync
 */
var getDirs = function(srcpath, cb) {
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
      })
    }
    async.filter(files, iterator, cb);
  });
}

/**
 * Sort an array by property 
 *
 * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
var sortArrayByProperty = function(array, propertyName, inverse) {
  if (inverse)
    var sorter = function (a, b) {
      if (a[propertyName] > b[propertyName] ) {
        return 1;
      }
      if (a[propertyName]  < b[propertyName] ) {
        return -1;
      }
      // a must be equal to b
      return 0;
    };
  else
    var sorter = function (a, b) {
      if (a[propertyName] < b[propertyName] ) {
        return 1;
      }
      if (a[propertyName]  > b[propertyName] ) {
        return -1;
      }
      // a must be equal to b
      return 
    };
  
  array.sort(sorter);
  return array;
}

/**
 * This functions sets a position property identical wit the current array index.
 * Useful for objects they requiring a position property.
 */
var fixPosition = function (obj) {
  for (var i = 0; i < obj.length; i++) {
      obj[i].position = i+1;
  };
  return obj;
};

/**
 * The following functions are public.
 */
module.exports = {
  isUndefined: underscore.isUndefined
  , isDefined: isDefined
  , $filter: $filter
  , getDirsSync: getDirsSync
  , getDirs: getDirs
  , sortArrayByProperty: sortArrayByProperty
  , extend: extend
  , isArray: underscore.isArray
  , invertOrder: invertOrder
  , max: max
  , isNumber: isNumber
  , fixPosition: fixPosition
};
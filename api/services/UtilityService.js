var fs = require('fs-extra'); // https://github.com/jprichardson/node-fs-extra
var path = require('path');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/

// server compatibility to angular functions
// TODO outsource to node-angular?
var isDefined = function(value) {
  return !underscore.isUndefined(value);
};

var isUndefined = function(value) {
  return !isDefined(value);
};

var $filter = function(filtername) {
  switch (filtername) {
    case 'orderBy':
      return underscore.sortBy;
  }
}

// http://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
// TODO outsource to path-extra or fs-extra?
var getDirsSync = function (srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

/**
 * get an array of dirs in path
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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
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

module.exports = {
  isDefined: isDefined
  , isUndefined: isUndefined
  , $filter: $filter
  , getDirsSync: getDirsSync
  , getDirs: getDirs
  , sortArrayByProperty: sortArrayByProperty
};
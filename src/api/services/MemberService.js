var underscore = require('underscore'); // http://documentcloud.github.io/underscore/

// server compatibility to angular functions
// TODO auslagern in eigene Library
var $filter = function(filtername) {
  switch (filtername) {
    case 'orderBy':
      return underscore.sortBy;
    break;
  }
}

// TODO testme
var sort = function(members) {
  return $filter('orderBy')(members, 'position');
}

module.exports = {
  sort: sort
}

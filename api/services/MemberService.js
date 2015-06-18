
var sort = function(members) {
  return UtilityService.$filter('orderBy')(members, 'position');
}

var convertFileIterator = function (site, file, callback) {
  thumbnailOptions = {width: 280, path: sails.config.paths.members};
  FileService.convertFileIterator(site, file, sails.config.paths.members, thumbnailOptions, callback);
}

module.exports = {
  sort: sort,
  convertFileIterator: convertFileIterator,
}

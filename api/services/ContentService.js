
/*
 * get all contents for page including images for each content.name 
 */
var resolveAllWithImage = function(page, site, type, cb) {
  var query = {
    where: {
      page: page,
      site: site
    },
    sort: 'position'
  };

  if(type) {
    query.where.type = type;
  }

  // sails.log.debug("query", query)
  Content.find(query).exec(function found (err, contents) {
    if (err) return cb(err);
    // TODO maybe remove this and make shure the positions are okay on client site
    contents = UtilityService.fixPosition(contents);

    async.map(contents, GalleryService.findForContent, function(err, imagesForEachContent) {
      if (err) return cb(err);
      imagesForEachContent = GalleryService.convertImageArrayToObject(imagesForEachContent);
      cb(null, {contents:contents, images:imagesForEachContent});
    });
  });
};

module.exports = {
  resolveAllWithImage: resolveAllWithImage
}
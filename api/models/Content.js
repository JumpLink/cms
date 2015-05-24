
var fixContent = function(content, cb) {
  if(!content.name || content.name === "") {
    var re = new RegExp("^[a-zA-Z]$");
    content.name = content.title.toLowerCase().replace(/[^a-zA-Z]+/g, '');
    $log.debug("set content.name to", content.name);
  }
  if(cb) cb(null, content);
  else return content;
}

module.exports = {

  schema: true // save only the values defined in attributes in database

  , attributes: {
    site: {
      type: "string"
      , required: true
      // , unique: true // composite keys not supported: https://github.com/balderdashy/waterline/issues/221
    },
    page: {
      type: "string"
      , required: true
      // , unique: true // composite keys not supported: https://github.com/balderdashy/waterline/issues/221
    },
    // TODO allow only letters
    name: {
      type: "string"
      , required: true
      // , unique: true // composite keys not supported: https://github.com/balderdashy/waterline/issues/221
    },
    // WORKAROUND http://stackoverflow.com/questions/24923750/sails-js-composite-unique-field
    key: {
      type: 'string'
      , required: true
      , unique: true
    },
    content: {
      type: "string"
      , required: true
    },
    position: {
      type: "number"
      , required: false
    },
    title: {
      type: "string"
      , required: false
    },
  }

  // Lifecycle Callbacks
  , beforeValidation : function(values, cb) {
    values = fixContent(values);
    values.key = values.site+"."+values.page+"."+values.name;
    cb();
  }

};

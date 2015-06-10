
var fixName = function(name, title, cb) {
  if(!name || name === "") {
    var re = new RegExp("^[a-zA-Z]$");
    name = title.toLowerCase().replace(/[^a-zA-Z]+/g, '');
    sails.log.debug("set name to", name);
  }
  if(cb) cb(null, name);
  else return name;
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
      , required: false
    },
    position: {
      type: "number"
      , required: false
    },
    title: {
      type: "string"
      , required: false
    },
    type: {
      type: "string"
      , required: false
    },
  }

  // Lifecycle Callbacks
  , beforeValidation : function(values, cb) {
    values.name = fixName(values.name, values.title);
    values.key = values.site+"."+values.page+"."+values.name;
    cb();
  }

};

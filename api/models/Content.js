/**
 * 
 */

/**
 * 
 */
var fixName = function(name, title, cb) {
  // sails.log.debug("fixName");
  // sails.log.debug("name:", name);
  // sails.log.debug("title:", title);

  if(!name || name === "") {
    var re = new RegExp("^[a-zA-Z]$");
    if(title) name = title.toLowerCase().replace(/[^a-zA-Z]+/g, '');
    else sails.log.error("title not set");
    
    sails.log.debug("set name to", name);
  }
  if(cb) cb(null, name);
  else return name;
}

/**
 * 
 */
var beforeValidation = function(values, cb) {
  sails.log.debug("beforeValidation", values);
  values.name = fixName(values.name, values.title);
  values.key = values.site+"."+values.page+"."+values.name;
  values.position = Number(values.position); // WORKAROUND
  cb();
};

/**
 * 
 */
var attributes = {
  site: {
    type: "string"
    , required: true
    // , unique: true // composite keys not supported: https://github.com/balderdashy/waterline/issues/221
  },
  page: {
    type: "array"
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
    type: "json"
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
};

/**
 * 
 */
module.exports = {
  schema: true, // save only the values defined in attributes in database
  attributes: attributes,
  beforeValidation: beforeValidation,
};

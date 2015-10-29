/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt-nodejs');  // https://github.com/shaneGirish/bcrypt-nodejs

/**
 * 
 */
var beforeUpdateCreate = function(values, next) {
  
  if(typeof(values.password) === "undefined") {
    next();
  } else {
    bcrypt.hash(values.password, null, null, function(err, hash) {
      if(err) {
        sails.log.error("[models/User.js]", err);
        return next(new Error(err));
      }
      values.password = hash;
      next();
    });
  }

  // blogger | siteadmin | superadmin
  if(typeof(values.role) === "undefined") {
    next();
  } else {
    if(values.role != 'blogger' && values.role != 'siteadmin' && values.role != 'superadmin' && values.role != 'employee') {
      next(new Error("[models/User.js] User must have one of the following roles: 'blogger, 'siteadmin', 'superadmin', 'employee' but is "+values.role));
    }
  }

};

/**
 * 
 */
var beforeValidation = function(values,cb) {
  values.key = values.site+values.email;
  cb();
};

/**
 * 
 */
var attributes = {
  email: {
    type: "email"
    , required: true
    // , unique: true // composite keys not supported: https://github.com/balderdashy/waterline/issues/221
  },
  site: {
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
  name: {
    type: "string"
    , required: true
  },
  color: {
    type: "string"
    , hexColor: true
    , required: false
  },
  password: {
    type: 'string'
    , minLength: 6
    , required: true
  },
  role: {
    type: 'string'
    , required: true
    , defaultsTo: 'blogger'
  }
};

/**
 * 
 */
module.exports = {
  schema: true, // save only the values defined in attributes in database
  attributes: attributes,
  // Lifecycle Callbacks
  beforeCreate: beforeUpdateCreate,
  beforeUpdate: beforeUpdateCreate,
  beforeValidation: beforeValidation
};

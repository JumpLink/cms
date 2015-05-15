/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt');

var beforeUpdateCreate = function(values, next) {
  if(typeof(values.password) === "undefined") {
    next();
  } else {
    bcrypt.hash(values.password, 10, function(err, hash) {
      if(err) return next(err);
      values.password = hash;
      next();
    });
  }
}

module.exports = {

  schema: true // save only the values defined in attributes in database

  , attributes: {
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
    }
  }

  // Lifecycle Callbacks
  , beforeCreate: beforeUpdateCreate
  , beforeUpdate: beforeUpdateCreate
  , beforeValidation : function(values,cb) {
    values.key = values.site+values.email;
    cb();
  }

};

var moment = require('moment');
moment.locale('de');
var underscore = require('underscore'); // http://documentcloud.github.io/underscore/

// server compatibility to angular functions
// TODO auslagern in eigene Library
var angular = {
  isUndefined: underscore.isUndefined,
  isDefined: function(value) {
    return !underscore.isUndefined(value);
  },
}
var $filter = function(filtername) {
  switch (filtername) {
    case 'orderBy':
      return underscore.sortBy;
    break;
  }
}

// TODO testme
var sort = function(events) {
  return $filter('orderBy')(events, 'from');
}

var split = function(events) {
  var unknown = [], before = [], after = [];
  for (var i = 0; i < events.length; i++) {

    if(angular.isDefined(events[i].from)) {
      if(events[i].from.isAfter())
        after.push(events[i]);
      else
        before.push(events[i]);
    } else {
      unknown.push(events[i]);
    }
  };
  return {unknown:unknown, before:before, after:after};
}

var momentise = function(events) {
  for (var i = 0; i < events.length; i++) {

    if(angular.isDefined(events[i].to)) {
      events[i].to = moment(events[i].to);
    }

    if(angular.isDefined(events[i].from)) {
      events[i].from = moment(events[i].from);
    }
  }
  return events;
}

var merge = function(unknown, before, after) {
  if(angular.isUndefined(unknown))
    unknown = [];
  if(angular.isUndefined(before))
    before = [];
  if(angular.isUndefined(after))
    after = [];
  return unknown.concat(before).concat(after);
}

module.exports = {
  split: split
  , sort: sort
  , merge: merge
  , momentise: momentise
}

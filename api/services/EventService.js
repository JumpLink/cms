/**
 * Events meens events of Timeline
 */

var moment = require('moment');
moment.locale('de');

/**
 * 
 */
var sort = function(events) {
  return UtilityService.$filter('orderBy')(events, 'from');
}

/**
 * 
 */
var split = function(events) {
  var unknown = [], before = [], after = [];
  for (var i = 0; i < events.length; i++) {

    if(UtilityService.isDefined(events[i].from)) {
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

/**
 * 
 */
var momentise = function(events) {
  for (var i = 0; i < events.length; i++) {

    if(UtilityService.isDefined(events[i].to)) {
      events[i].to = moment(events[i].to);
    }

    if(UtilityService.isDefined(events[i].from)) {
      events[i].from = moment(events[i].from);
    }
  }
  return events;
}

/**
 * 
 */
var transform = function(events) {
  events = split(momentise(sort(events)));
  events.before = UtilityService.invertOrder(events.before);
  return events;
}

/**
 * 
 */
var merge = function(unknown, before, after) {
  if(UtilityService.isUndefined(unknown))
    unknown = [];
  if(UtilityService.isUndefined(before))
    before = [];
  if(UtilityService.isUndefined(after))
    after = [];
  return unknown.concat(before).concat(after);
}

/**
 * 
 */
module.exports = {
  split: split
  , sort: sort
  , merge: merge
  , momentise: momentise
  , transform: transform
}

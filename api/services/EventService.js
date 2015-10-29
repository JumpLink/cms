/**
 * Events meens events of Timeline
 */
var moment = require('moment');
moment.locale('de');

/**
 * Sort events by time
 */
var sort = function(events, property) {
  if(UtilityService.isUndefined(property)) property = 'from';
  return UtilityService.$filter('orderBy')(events, property);
}

/**
 * Split events in:
 * * `after` íf date is in the future / after the current time)
 * * `before` (date is in the past / before the current time)
 * * `unknown` if the date could not be assigned
 * 
 * @see http://momentjs.com/docs/#/query/is-after/
 */
var split = function(events, property) {
  if(UtilityService.isUndefined(property)) property = 'from';
  var unknown = [], before = [], after = [];
  for (var i = 0; i < events.length; i++) {
    if(UtilityService.isDefined(events[i][property])) {
      sails.log.debug("[EventService.split]", property, i, events[i][property]);
      if(events[i][property].isAfter())
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
 * Makes moment objects of date objects for each property in properties for each event in events
 * 
 * @see http://stackoverflow.com/questions/2673121/how-to-check-if-object-has-any-properties-in-javascript
 */
var momentise = function(events, properties) {
  if(!UtilityService.isArray(properties)) properties = ['from', 'to'];
  for (var i = 0; i < events.length; i++) {
    for(var k in properties) {
      var property = properties[k];
      sails.log.debug("[EventService.momentise property", property, i);
      if (events[i].hasOwnProperty(property)) {
        events[i][property] = moment(events[i][property]);
        sails.log.debug("[EventService.momentise hasOwnProperty", property, i, events[i]);
      }
    }
  }
  return events;
}

/**
 * sort, mentise and split the events
 */
var transform = function(events, invertBefore) {
  if(UtilityService.isUndefined(invertBefore)) invertBefore = true;
  events = split(momentise(sort(events)));
  if(invertBefore) events.before = UtilityService.invertOrder(events.before);
  return events;
}

/**
 * Merge / concat the events from `unknown`, `before` and `after` back to one array
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
 * Public functions
 */
module.exports = {
  split: split,
  sort: sort,
  merge: merge,
  momentise: momentise,
  transform: transform,
}

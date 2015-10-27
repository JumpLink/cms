var cleanup = function (objectArray, toRemoveOptions) {
  for (var i = 0; i < objectArray.length; i++) {
    if(toRemoveOptions.id === true) {
      delete objectArray[i].id;
    }
    if(toRemoveOptions.site === true) {
      delete objectArray[i].site;
    }
  }
  return objectArray;
};

/**
 * public functions
 */
module.exports = {
  cleanup: cleanup
};
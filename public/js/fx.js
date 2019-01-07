/* jshint esversion: 6 */
const Fx = (function() {

  const backgroundLayer = [];
  const foregroundLayer = [];

  function add(event, data) {
    events[eventID] = data;
  }

  function listen(eventID) {
    if (!events[eventID]) {
      return null;
    } else {
      return events[eventID];
    }
  }

  return {
    add
  };
}());

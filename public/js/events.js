/* jshint esversion: 6 */
const Events = (function() {

  const events = {};

  function emit(eventID, data) {
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
    emit,
    listen,
    events
  };
}());

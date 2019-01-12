/* jshint esversion: 6 */
const Utils = (function() {

  function randomID() {
    return Math.floor(Math.random() * 100 * Math.random() * 100 * Math.random() * 100 * Math.random() * 100);
  }

  function randomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return {
    randomID, randomNumberBetween
  };
}());

/* jshint esversion: 6 */
const Assets = (function() {

  const images = {
    player: {},
    forest: {}
  };

  function push(type, name, img) {
    images[`${type}`][`${name.toString()}`] = img;
  }

  function img(type, id) {
    return images[type][id];
  }

  return {
    push,
    img,
    images
  };
}());

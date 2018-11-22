/* jshint esversion: 6 */
const Assets = (function() {

  const images = {
    player: {}
  };

  function push(type, name, img) {
    images[`${type}`][`${name.toString()}`] = img;
  }

  function img(type, id) {
    return images.player[id];
  }

  return {
    push,
    img,
    images
  };
}());

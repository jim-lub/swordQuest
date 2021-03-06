/* jshint esversion: 6 */
const Assets = (function() {

  const images = {
    hero: {},
    hellishsmith: {},
    swordknight: {},
    forest: {},
    ui: {},
    fx: {}
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

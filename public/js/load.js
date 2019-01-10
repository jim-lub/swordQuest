/* jshint esversion: 6 */
const Load = (function() {

  function _loadJSON(file) {
    return new Promise((resolve, reject) => {
      $.getJSON(`config/json/${file}`, (result) => { resolve(result); });
    });
  }

  function _loadImage(src) {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.src = src;
      resolve(image);
    });
  }

  function _load(json, type) {
    return new Promise((resolve, reject) => {
      _loadJSON(json).then((data) => {
        const folder = data[type].folder;
        const images = data[type].images;

        let objects = Object.entries(images);

        objects.map(obj => {
          return _loadImage(folder + obj[1])
          .then((img) => {
            Assets.push(type, obj[0], img);
          })
          .catch(e => reject(e));
        });
        Promise.all(objects)
        .then(() => resolve())
        .catch(e => reject(e));
      });
    });
  }

  function _loadSprites(json, type) {
    return new Promise((resolve, reject) => {
      _loadJSON(json).then((data) => {
        const folder = data[type].data.folder;
        const images = data[type].data.images;

        let objects = Object.entries(images);

        objects.map(obj => {
          return _loadImage(folder + obj[1])
          .then((img) => {
            Assets.push(type, obj[0], img);
          })
          .catch(e => reject(e));
        });
        Promise.all(objects)
        .then(() => resolve())
        .catch(e => reject(e));
      });
    });
  }

  function images() {
    return new Promise((resolve, reject) => {
      let promises = [];

      promises.push(_loadSprites('animations/hero.json', 'hero'));
      promises.push(_loadSprites('animations/hellishsmith.json', 'hellishsmith'));
      promises.push(_loadSprites('animations/swordknight.json', 'swordknight'));

      promises.push(_load('backgrounds.json', 'forest'));

      Promise.all(promises)
      .then(() => resolve())
      .catch(e => reject(e));
    });
  }

  return {
    images
  };
}());

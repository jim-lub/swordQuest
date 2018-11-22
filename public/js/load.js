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
    let all = [];
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
        Promise.all(objects).then(() => resolve());
      })
      .catch(e => reject(e));
    });
  }

  function images() {
    return new Promise((resolve, reject) => {
      let promises = [_load('sprites.json', 'player')];

      Promise.all(promises)
      .then(() => {
        resolve();
      })
      .catch(e => console.log(e));
    });
  }

  return {
    images
  };
}());

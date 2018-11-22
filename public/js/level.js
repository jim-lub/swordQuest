/* jshint esversion: 6 */
class Level {
  constructor() {
    this.blocks = ['block_01', 'block_02', 'block_03'];
    this.imagesrc = {
      dark32x32: 'assets/img/world/tiles/dark-32x32.png',
      dark64x64: 'assets/img/world/tiles/dark-64x64.png'
    };
    this.image = {
      dark32x32: null,
      dark64x64: null
    };
    this.imageAtlas = {
      dark32x32: new Map(),
      dark64x64: new Map()
    };
    this.static_tiles = [];
    this.emitted = false;
  }

  init() {
    this.image.dark32x32 = this.loadImage(this.imagesrc.dark32x32);
    this.image.dark64x64 = this.loadImage(this.imagesrc.dark64x64);

    this.setImageAtlasDark(this.imageAtlas.dark32x32, 32);
    this.setImageAtlasDark(this.imageAtlas.dark64x64, 64);
  }

  update() {
    Events.emit('world_static_tiles', this.static_tiles);

    this.resetCollisionArray();
  }

  resetCollisionArray() {
    this.static_tiles = [];
  }

  renderBackground(ctx) {
    let bgimage = new Image();
    bgimage.src = "assets/img/world/background/forest-castle.png";
    ctx.drawImage(bgimage, 0, 0, 1280, 640);
  }

  render(inputBlock, layer, ctx, offsetX, offsetY) {
    let block, settings, map, imageAtlas;

    if (inputBlock === 'block_01') block = this.block_01();
    if (inputBlock === 'block_02') block = this.block_02();

    if (layer === 4) {
      settings = block.layer_4_64x64.settings;
      map = block.layer_4_64x64.map;
      imageAtlas = this.imageAtlas.dark64x64;
    }

    if (layer === 5) {
      settings = block.layer_5_32x32.settings;
      map = block.layer_5_32x32.map;
      imageAtlas = this.imageAtlas.dark32x32;
    }

    for (let c = 0; c < settings.cols; c++) {
      for (let r = 0; r < settings.rows; r++) {

        let tile = this.getTile(map, settings, c, r);
        if (tile !== 0) {
          tile = imageAtlas.get(tile);
          let dX = (c * settings.size) + offsetX;
          let dY = (r * settings.size) + offsetY;

          ctx.drawImage(
            this.image.dark64x64,
            tile[0],
            tile[1],
            settings.size,
            settings.size,
            dX,
            dY,
            settings.size,
            settings.size
          );

          this.saveToStaticTileArray(dX, dY, settings.size, settings.size);
        }
      }
    }
  }

  getTile(map, settings, col, row) {
    return map[row * settings.cols + col];
  }

  saveToStaticTileArray(x, y, width, height) {
    this.static_tiles.push({
      x: x,
      y: y,
      width: width,
      height: height
    });
  }

  loadImage(src) {
    let image = new Image();
    image.src = src;
    return image;
  }

  block_01() {
    return {
      layer_4_64x64: {
        settings: {layer: 4, collision: true, atlas: this.imageAtlas.dark64x64, size: 64, cols: 10, rows: 10},
        map: [
          0, 0, 0, 0, 0, /**/ 0, 12, 11, 1, 1,
          0, 0, 0, 0, 0, /**/ 0, 6, 18, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 6, 18, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 2, 3, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          /********************************/
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 18, 0, 17, 0,
          0, 0, 0, 0, 0, /**/ 0, 18, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 4, 15, 15, 15
        ]
      },

      layer_5_32x32: {
        settings: {layer: 5, collision: true, atlas: this.imageAtlas.dark32x32, size: 32, cols: 20, rows: 20},
        map: [
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          /********************************/ /*|*/ /********************************/
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 14, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          /********************************/ /*|*/ /********************************/
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          15, 15, 15, 15, 15, /**/ 15, 15, 15, 15, 15, /*|*/ 15, 15, 15, 17, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          /********************************/ /*|*/ /********************************/
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0
        ]
      }
    };
  }

  block_02() {
    return {
      layer_4_64x64: {
        settings: {layer: 4, collision: true, size: 64, cols: 10, rows: 10},
        map: [
          1, 1, 1, 1, 1, /**/ 1, 1, 1, 1, 12,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 6,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 6,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 6,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 6,
          /********************************/
          0, 0, 17, 0, 0, /**/ 0, 0, 0, 0, 6,
          17, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 6,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 6,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 6,
          15, 15, 15, 15, 15, /**/ 15, 15, 15, 15, 5
        ]
      },

      layer_5_32x32: {
        settings: {layer: 5, collision: true, size: 32, cols: 20, rows: 20},
        map: [
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          /********************************/ /*|*/ /********************************/
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          /********************************/ /*|*/ /********************************/
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          /********************************/ /*|*/ /********************************/
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0
        ]
      }
    };
  }

  block_03() {
    const layer_4_64x64 = {
      settings: {layer: 4, collision: true, size: 64, cols: 10, rows: 10},
      map: [
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        /********************************/
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0
      ]
    };

    const layer_5_32x32 = {
      settings: {layer: 5, collision: true, size: 32, cols: 20, rows: 20},
      map: [
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        /********************************/ /*|*/ /********************************/
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        /********************************/ /*|*/ /********************************/
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        /********************************/ /*|*/ /********************************/
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0, /*|*/ 0, 0, 0, 0, 0, /**/ 0, 0, 0, 0, 0
      ]
    };
  }

  setImageAtlasDark(imageAtlas, size) {
    imageAtlas.set(1, [0, 0]);
    imageAtlas.set(2, [size, 0]);
    imageAtlas.set(3, [size * 2, 0]);
    imageAtlas.set(4, [size * 3, 0]);
    imageAtlas.set(5, [size * 4, 0]);
    imageAtlas.set(6, [size * 5, 0]);
    imageAtlas.set(7, [size * 6, 0]);

    imageAtlas.set(8, [0, size]);
    imageAtlas.set(9, [size, size]);
    imageAtlas.set(10, [size * 2, size]);
    imageAtlas.set(11, [size * 3, size]);
    imageAtlas.set(12, [size * 4, size]);
    imageAtlas.set(13, [size * 5, size]);

    imageAtlas.set(14, [0, size * 2]);
    imageAtlas.set(15, [size, size * 2]);
    imageAtlas.set(16, [size * 2, size * 2]);
    imageAtlas.set(17, [size * 3, size * 2]);
    imageAtlas.set(18, [size * 4, size * 2]);
    imageAtlas.set(19, [size * 5, size * 2]);
  }
}

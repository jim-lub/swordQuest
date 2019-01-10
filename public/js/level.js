/* jshint esversion: 6 */
class Level {
  constructor() {
    this.background = new Parallax();
    this.ticks = 0;
  }


  update() {

  }

  render(ctx) {
    this.background.render(ctx, 'forest');
  }
}

class Tile {
  constructor(object) {
    this.x = object.x;
    this.y = object.y;
    this.width = object.width;
    this.height = object.height;
  }
}

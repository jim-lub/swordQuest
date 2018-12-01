/* jshint esversion: 6 */
class Engine {
  constructor() {
    this.tiles = [];
    this.entities = [];
  }

  newTile(x,  y, width, height) {
    this.tiles.push(new Tile({x, y, width, height}));
  }

  newEntity(x, y, width, height, mass) {
    this.entities.push(new Entity({x, y, width, height, mass}));
  }

  update(dt) {
    this.entities.forEach(cur => {
      cur.update(dt);
      cur.collision.tiles = this.tiles;
    });
  }
}

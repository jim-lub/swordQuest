/* jshint esversion: 6 */
class CollisionDetection {
  constructor() {
    this.tiles = [];
    this.entities = [];
    this.collisionPoints = [];
    this.x = false;
    this.y = false;
  }

  update(id, pos, vel, width, height) {
    this.tiles = Events.listen('tiles');
    this.entities = Events.listen('ENEMIES');
    this.x = false;
    this.y = false;

    let hitboxX = this.hitbox(pos, {x: vel.x, y: 0}, width, height);
    let hitboxY = this.hitbox(pos, {x: 0, y: vel.y}, width, height);

    this.collisionPoints = this.hitbox(pos, {x: vel.x, y: vel.y}, width, height);

    this.tiles.forEach(tile => {
      if (this.boxCollision(hitboxX, tile)) this.x = true;
      if (this.boxCollision(hitboxY, tile)) this.y = true;
    });

    this.entities.forEach(entity => {
      if (entity.id != id) {
        if (this.boxCollision(hitboxX, {
          x: entity.pos.x,
          y: entity.pos.y,
          width: entity.hitbox.width,
          height: entity.hitbox.height
        })) this.x = true;
        if (this.boxCollision(hitboxY, {
          x: entity.pos.x,
          y: entity.pos.y,
          width: entity.hitbox.width,
          height: entity.hitbox.height
        })) this.y = true;
      }
    });

    this.tiles = [];
    this.entities = [];
  }

  hit(axis) {
    return this[axis];
  }

  boxCollision(points, tile) {
    let isColliding = false;

    for (let i = 0; i < points.length; i++) {
      if (this.pointCollision(points[i], tile)) {
        isColliding = true;
        break;
      }
    }

    return isColliding;
  }

  pointCollision(point, tile) {
    let collisionX = point.x >= tile.x && point.x <= tile.x + tile.width;
    let collisionY = point.y >= tile.y && point.y <=tile.y + tile.height;

    return (collisionX && collisionY);
  }

  hitbox(pos, vel, width, height) {
    return [
      {
        x: pos.x + vel.x,
        y: pos.y + vel.y
      },
      {
        x: pos.x + vel.x,
        y: pos.y + vel.y + height
      },
      {
        x: pos.x + vel.x + width,
        y: pos.y + vel.y
      },
      {
        x: pos.x + vel.x + width,
        y: pos.y + vel.y + height
      }
    ];
  }
}

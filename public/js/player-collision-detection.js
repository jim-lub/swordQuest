/* jshint esversion: 6 */
class CollisionDetection {
  constructor() {
    this.x = false;
    this.y = false;
    this.floor = false;
    this.collided = [];
  }

  hit(axis) {
    return this[axis];
  }

  listen({player, static_tiles}) {
    this.set_update({player});

    let  filteredTiles = this.filter(static_tiles, (player.pos.x - 150), (player.pos.x + 150), (player.pos.y - 150), (player.pos.y + 150));

    this.floor = (this.get_update({player, hitbox: this.hitbox, static_tiles: filteredTiles}, 'floor')) ? true : false;
    this.x = (this.get_update({player, hitbox: this.hitbox, static_tiles: filteredTiles}, 'x')) ? true : false;
    this.y = (this.get_update({player, hitbox: this.hitbox, static_tiles: filteredTiles}, 'y')) ? true : false;
  }

  /*******************************************
  * FILTER TILES
  *******************************************/
  filter(tiles, x1, x2, y1, y2) {
    let array = [];
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].x > x1 && tiles[i].x < x2 && tiles[i].y > y1 && tiles[i].y < y2) array.push(tiles[i]);
    }
    return array;
  }

  /*******************************************
  * CHECK FOR COLLISIONS
  *******************************************/
  get_update({player, hitbox, static_tiles}, axis) {
    for (let i = 0; i < static_tiles.length; i++) {
      if (this.get_boxCollision({player, hitbox, tile: static_tiles[i]}, axis)) {
        return true;
      }
    }
  }

  get_boxCollision({player, hitbox, tile}, axis) {
    for (let i = 0; i < hitbox.collisionPoints.length; i++) {
      if (this.get_pointCollision({player, point: hitbox.collisionPoints[i], tile}, axis)) {
        return true;
      }
    }
  }

  get_pointCollision({player, point, tile}, axis) {
    let verticalMotion = player.motion.ver;
    let horizontalMotion = player.motion.hor;
    if (axis === 'floor') {
      verticalMotion = 1;
      horizontalMotion = 0;
    } else {
      if (axis === 'x') verticalMotion = 0;
      if (axis === 'y') horizontalMotion = 0;
    }

    let collisionX = point.x + horizontalMotion >= tile.x && point.x + horizontalMotion <= tile.x + tile.width;
    let collisionY = point.y + verticalMotion >= tile.y && point.y + verticalMotion <= tile.y + tile.height;

    return (collisionX && collisionY);
  }

  /*******************************************
  * SET AND UPDATE COLLISION POINTS
  *******************************************/
  set_update({player}) {
    let _ = {
      x: player.pos.x + player.hitbox.offsetX,
      y: player.pos.y + player.hitbox.offsetY,
      w: player.hitbox.width,
      h: player.hitbox.height,
      p: {
        left: 1,
        top: 1,
        right: 1,
        bottom: 1
      }
    };

    let collisionPoints = [
      ...this.set_CollisionPointsOnCorners({_}),
      ...this.set_CollisionPointsOnEdge({_}, _.p.left, 'left'),
      ...this.set_CollisionPointsOnEdge({_}, _.p.top, 'top'),
      ...this.set_CollisionPointsOnEdge({_}, _.p.right, 'right'),
      ...this.set_CollisionPointsOnEdge({_}, _.p.bottom, 'bottom')
    ];

    this.hitbox = {
      pos: {x: _.x, y: _.y},
      size: {w: _.w, h: _.h},
      collisionPoints
    };
  }

  set_CollisionPointsOnEdge({_}, n, edge) {
    let collisionPoints = [];
    for (let i = 1; i < (n + 1); i++) {
      let offsetW, offsetH;
      if (edge == 'left') {
        offsetW = 0;
        offsetH = _.h * (i / (n + 1));
      }
      if (edge == 'top') {
        offsetW = _.w * (i / (n + 1));
        offsetH = 0;
      }
      if (edge == 'right') {
        offsetW = _.w;
        offsetH = _.h * (i / (n + 1));
      }
      if (edge == 'bottom') {
        offsetW = _.w * (i / (n + 1));
        offsetH = _.h;
      }

      collisionPoints.push({x: _.x + offsetW, y: _.y + offsetH});
    }
    return collisionPoints;
  }

  set_CollisionPointsOnCorners({_}) {
    let collisionPoints = [];

    collisionPoints.push(
      {x: _.x, y: _.y},
      {x: _.x, y: (_.y + _.h)},
      {x: (_.x + _.w), y: _.y},
      {x: (_.x + _.w), y: (_.y + _.h)}
    );

    return collisionPoints;
  }

  /****************************************
  *
  * TESTING ONLY
  *
  ****************************************/
  drawHitBox(ctx) {
    let x = Math.floor(this.hitbox.pos.x);
    let y = Math.floor(this.hitbox.pos.y);
    let w = Math.floor(this.hitbox.size.w);
    let h = Math.floor(this.hitbox.size.h);
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 1;
  }

  drawCollisionPoints(ctx) {
    ctx.fillStyle = 'orange';
    this.hitbox.collisionPoints.forEach(point => {
      ctx.fillRect(Math.floor(point.x - 1), Math.floor(point.y - 1), 2, 2);
    });
    ctx.fillStyle = 'black';
  }

}

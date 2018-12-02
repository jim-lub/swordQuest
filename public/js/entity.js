/* jshint esversion: 6 */
/*****************************
*
******************************/
class Tile {
  constructor(object) {
    this.x = object.x;
    this.y = object.y;
    this.width = object.width;
    this.height = object.height;
  }
}


/*****************************
*
******************************/
class Entity {
  constructor(object) {
    this.mass = object.mass;
    this.width = object.width;
    this.height = object.height;
    this.pos = new Vector(object.x, object.y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.collision = new CollisionDetection();
    this.vAcc = 0;

    this.F = {
      epsilon: 0.1,
      gravity: 9.81,
      friction: -0.99,
      drag: -0.05
    };
  }

  apply(v) {
    let f = Vector.divide(v, this.mass);
    this.acceleration.add(f);
  }

  _gravity() {
    let f = new Vector(0, (this.F.gravity * (this.mass * 12)));
    return f;
  }

  _friction() {
    let f = this.velocity.clone();
    f.normalize();
    f.multiply(this.F.friction);
    return f;
  }

  _drag() {
    let f = this.velocity.clone();
    let speed = this.velocity.mag();
    f.normalize();
    f.multiply(this.F.drag * speed * speed);
    return f;
  }

  jump() {
    this.vAcc = 50000;
  }

  XY(v) {
    return {
      x: this[v].x,
      y: this[v].y
    };
  }

  update(dt) {
    this.apply(this._friction());
    this.apply(this._drag());
    if (this.vAcc > 0) {
      this.apply(new Vector(0, -this.vAcc));
      this.vAcc *= 0.92;
    }
    if (this.vAcc < 1000) this.vAcc = 0;
    this.apply(this._gravity());

    this.velocity.add(this.acceleration);

    if (Math.abs(this.velocity.x) < 0.2) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 0.2) this.velocity.y = 0;

    this.collision.update(this.pos, Vector.multiply(this.velocity, dt), this.width, this.height);

    if (this.collision.hit('y')) this.velocity.set(this.velocity.x, 0);
    if (this.collision.hit('x')) this.velocity.set(0, this.velocity.y);

    this.velocity.multiply(dt);

    this.pos.add(this.velocity);
    if (Events.listen('PLAYER_HIT_LEFT_WALL') || Events.listen('PLAYER_HIT_RIGHT_WALL')) this.pos.set((this.pos.x - this.velocity.x), this.pos.y);

    this.acceleration.multiply(0);
  }
}

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
    this.position = new Vector(object.x, object.y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.collision = new CollisionDetection();

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
    let f = new Vector(0, this.F.gravity * this.mass);
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

  move(x, y) {
    let force = new Vector(x, y);
    this.apply(force);
  }

  jump(x, y) {
    let force = new Vector(x, y);
    this.apply(force);
  }

  XY(v) {
    return {
      x: this[v].x,
      y: this[v].y
    };
  }

  update(dt) {
    this.apply(Vector.multiply(this._gravity(), 1));
    this.apply(Vector.multiply(this._friction(), 1));
    this.apply(Vector.multiply(this._drag(), 1));

    this.velocity.add((this.acceleration.multiply(dt)));

    // if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
    // if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;

    this.collision.update(this.position, Vector.multiply(this.velocity, dt), this.width, this.height);

    if (this.collision.hit('y')) this.velocity.set(this.velocity.x, 0);
    if (this.collision.hit('x')) this.velocity.set(0, this.velocity.y);

    this.position.add(this.velocity.multiply(dt));

    this.acceleration.multiply(0);
  }
}

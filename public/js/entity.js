/* jshint esversion: 6 */

const Entity = (function() {
  let ENTITIES = [];
  let ATTACKS = [];

  const FORCES = {
    epsilon: 0.1,
    gravity: 9.81,
    friction: -0.99,
    drag: -0.05
  };

  function update(dt) {
    ENTITIES.forEach(entity => entity.update(dt));
  }

  function render(ctx) {
    ENTITIES.forEach(entity => entity.render(ctx));
  }

  function init({player, npcs}) {

    player.forEach(player => ENTITIES.push(_createPlayer(player)));

    npcs.forEach(npc => ENTITIES.push(_createNpc(npc)));

    console.log(ENTITIES);
  }

  function _createPlayer(player) {
    let state = {
      id: 0,
      isPlayerControlled: true,
      type: player.type,
      startPosition: {x: player.x, y: player.y},
      health: player.health || 100,
      hitbox: {
        width: player.width,
        height: player.height
      },
      mass: player.mass || 200,
      direction: player.direction || 'right'
    };

    return Object.assign(state, ...[_entity(state), _render(state)]);
  }

  function _createNpc(npc) {
    let state = {
      id: _generateRandomID(),
      isPlayerControlled: false,
      type: npc.type,
      startPosition: {x: npc.x, y: npc.y},
      health: npc.health || 100,
      hitbox: {
        width: npc.width,
        height: npc.height
      },
      mass: npc.mass || 400,
      direction: npc.direction || 'right'
    };

    return Object.assign(state, ...[_entity(state), _render(state)]);
  }

  const _entity = (state) => ({
    position: new Vector(state.startPosition.x, state.startPosition.y),
    velocity: new Vector(),
    acceleration: new Vector(),
    collision: new CollisionDetection(),

    update: (dt) => {
      state.animations.play('idle', state.direction);

      // state.applyForce(new Vector(5000, 0));
      
      _updatePhysics(state, dt);
    },

    applyForce: (vector) => {
      let force = Vector.divide(vector, state.mass);
      state.acceleration.add(force);
    }
  });

  const _render = (state) => ({
    animations: Animations.assign(state.type),

    render: (ctx) => {
      let currentFrame = state.animations.currentData;

      ctx.drawImage(state.animations.currentSprite,
                    currentFrame.sX,
                    currentFrame.sY,
                    currentFrame.sWidth,
                    currentFrame.sHeight,
                    Math.round(-Events.listen('CAMERA_OFFSET_X') + state.position.x + currentFrame.offsetX),
                    Math.round(state.position.y + currentFrame.offsetY),
                    currentFrame.sWidth, currentFrame.sHeight);
    }
  });


  /*****************************
  * Physics
  ******************************/
  function _updatePhysics(state, dt) {
    state.applyForce(_gravity(state));
    state.applyForce(_friction(state));
    state.applyForce(_drag(state));

    state.velocity.add(state.acceleration);

    if (Math.abs(state.velocity.x) < FORCES.epsilon) state.velocity.x = 0;
    if (Math.abs(state.velocity.y) < FORCES.epsilon) state.velocity.y = 0;

    state.collision.update(state.id, state.position, Vector.multiply(state.velocity, dt), state.hitbox.width, state.hitbox.height);

    if (state.collision.hit('y')) state.velocity.set(state.velocity.x, 0);
    if (state.collision.hit('x')) state.velocity.set(0, state.velocity.y);

    state.velocity.multiply(dt);
    state.position.add(state.velocity);
    state.acceleration.multiply(0);
  }

  function _gravity(state) {
    let f = new Vector(0, (FORCES.gravity * (state.mass * 12)));
    return f;
  }

  function _friction(state) {
    let f = state.velocity.clone();
    f.normalize();
    f.multiply(FORCES.friction);
    return f;
  }

  function _drag(state) {
    let f = state.velocity.clone();
    let speed = state.velocity.mag();
    f.normalize();
    f.multiply(FORCES.drag * speed * speed);
    return f;
  }


  /*****************************
  * UTILS
  ******************************/
  function _getPlayerID() {
    return 0;
  }

  function _generateRandomID() {
    return Math.floor(Math.random() * 100 * Math.random() * 100 * Math.random() * 100 * Math.random() * 100);
  }

  /*****************************
  * PUBLIC
  ******************************/
  return {
    ENTITIES, ATTACKS,
    init, update, render
  };
}());


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
class Entity2 {
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

    this.collision.update(0, {x: this.pos.x + Events.listen('CAMERA_OFFSET_X'), y: this.pos.y}, Vector.multiply(this.velocity, dt), this.width, this.height);

    if (this.collision.hit('y')) this.velocity.set(this.velocity.x, 0);
    if (this.collision.hit('x')) this.velocity.set(0, this.velocity.y);

    this.velocity.multiply(dt);

    this.pos.add(this.velocity);
    if (Events.listen('PLAYER_HIT_LEFT_WALL') || Events.listen('PLAYER_HIT_RIGHT_WALL')) this.pos.set((this.pos.x - this.velocity.x), this.pos.y);

    this.acceleration.multiply(0);
  }
}

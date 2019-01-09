/* jshint esversion: 6 */
const Entity = (function() {
  const Ctrls = new Controls();

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

    npcs.forEach(npc => ENTITIES.push(_createNpc(npc)));

    player.forEach(player => ENTITIES.push(_createPlayer(player)));

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

    return Object.assign(state, ...[_entity(state), _render(state), _player(state)]);
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
      fov: 150,
      radius: 75,
      mass: npc.mass || 400,
      direction: npc.direction || 'right'
    };

    return Object.assign(state, ...[_entity(state), _render(state), _melee(state)]);
  }

  const _entity = (state) => ({
    position: new Vector(state.startPosition.x, state.startPosition.y),
    velocity: new Vector(),
    acceleration: new Vector(),
    collision: new CollisionDetection(),

    update: (dt) => {
      state.transitions[state.currentState].active();
      state.animations.play(state.currentState, state.direction);

      // state.applyForce(new Vector(5000, 0));
      if (Ctrls.isPressed('space')) {
        // console.log(state.direction);
        state.dispatch('attack');
      }

      _updatePhysics(state, dt);
    },

    applyForce: (vector) => {
      let force = Vector.divide(vector, state.mass);
      state.acceleration.add(force);
    },

    currentState: 'idle',

    dispatch: (actionName) => {
      const actions = state.transitions[state.currentState];
      const action = state.transitions[state.currentState][actionName];

      if (action) {
        action.apply(state);
      }
    },

    changeStateTo: (transition) => {
      state.currentState = transition;
    }
  });

  const _render = (state) => ({
    animations: Animations.assign(state.type),

    render: (ctx) => {
      let currentFrame = state.animations.currentData;

      Tests.drawFov(ctx, Math.round(_convertToRelativeCoordinate(state.position.x)), Math.round(state.position.y), state.hitbox.width, state.hitbox.height, state.fov);
      Tests.drawAttackRadius(ctx, Math.round(_convertToRelativeCoordinate(state.position.x)), Math.round(state.position.y), state.hitbox.width, state.hitbox.height, state.radius);

      ctx.drawImage(state.animations.currentSprite,
                    currentFrame.sX,
                    currentFrame.sY,
                    currentFrame.sWidth,
                    currentFrame.sHeight,
                    Math.round(_convertToRelativeCoordinate(state.position.x) + currentFrame.offsetX),
                    Math.round(state.position.y + currentFrame.offsetY),
                    currentFrame.sWidth, currentFrame.sHeight);

      Tests.drawHitbox(ctx, Math.round(_convertToRelativeCoordinate(state.position.x)), Math.round(state.position.y), state.hitbox.width, state.hitbox.height);
      Tests.drawCollisionPoints(ctx, true, state.collision.collisionPoints);
    }
  });

  /*****************************
  * FSM
  ******************************/
  const _player = (state) => ({
    transitions: {
      'idle': {
        active() { _idlePLAYER(state); },
        run() { state.changeStateTo('run'); },
        jump() { state.changeStateTo('jump'); },
        fall() { state.changeStateTo('fall'); }
      },
      'run': {
        active() { _runPLAYER(state); },
        idle() { state.changeStateTo('idle'); },
        jump() {state.changeStateTo('jump'); },
        fall() { state.changeStateTo('fall'); }
      },
      'jump': {
        active() { _jumpPLAYER(state); },
        fall() { state.changeStateTo('fall'); }
      },
      'fall': {
        active() { _fallPLAYER(state); },
        idle() { state.changeStateTo('idle'); }
      }
    }
  });

  const _melee = (state) => ({
    transitions: {
      'idle': {
        active() { _idleNPC(state); },
        run() { state.changeStateTo('run'); },
        attack() { state.changeStateTo('attack'); }
      },
      'run': {
        active() { _runNPC(state); },
        idle() { state.changeStateTo('idle'); },
        attack() { state.changeStateTo('attack'); }
      },
      'attack': {
        active() { _attackNPC(state); },
        idle() { state.changeStateTo('idle'); },
        run() { state.changeStateTo('run'); }
      }
    }
  });

  /*****************************
  * Actions -- PLAYER
  ******************************/
  function _idlePLAYER(state) {
    if (Math.abs(state.velocity.x) > 0) state.dispatch('run');

    if (_getPlayerID() === state.id) {
      if (Ctrls.isPressed('a')) state.applyForce(new Vector(-25000, 0));
      if (Ctrls.isPressed('d')) state.applyForce(new Vector(25000, 0));
    }
  }

  function _runPLAYER(state) {
    if (Math.abs(state.velocity.x) === 0) state.dispatch('idle');

    if (_getPlayerID() === state.id) {
      if (Ctrls.isPressed('a')) state.applyForce(new Vector(-25000, 0));
      if (Ctrls.isPressed('d')) state.applyForce(new Vector(25000, 0));
    }
  }

  function _attackPLAYER(state) {

  }

  /*****************************
  * Actions -- NPC
  ******************************/
  function _idleNPC(state) {
    if (Math.abs(state.velocity.x) > 0) state.dispatch('run');

    _updateDirection(state);

    let distance = _distanceToPlayer(state);

    if (distance > state.radius && distance < state.fov) state.dispatch('run');
    if (distance < state.radius) state.dispatch('attack');
  }

  function _runNPC(state) {
    if (Math.abs(state.velocity.x) === 0) state.dispatch('idle');

    _updateDirection(state);

    let distance = _distanceToPlayer(state);

    if (distance > state.radius && distance < state.fov) state.applyForce(new Vector(15000 * -state.directionInt, 0));
    if (distance < state.radius) state.dispatch('attack');
  }

  function _attackNPC(state) {
    _updateDirection(state);

    let distance = _distanceToPlayer(state);

    if (distance > state.radius) state.dispatch('idle');
  }


  /*****************************
  * Physics
  ******************************/
  function _updatePhysics(state, dt) {
    state.applyForce(_gravity(state));
    state.applyForce(_friction(state));
    // state.applyForce(_drag(state));

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

  function _getPlayerCoordindates() {
    let player = ENTITIES.filter(cur => {
      return cur.id === _getPlayerID();
    });

    return player[0].position;
  }

  function _getPlayerData() {
    let player = ENTITIES.filter(cur => {
      return cur.id === _getPlayerID();
    });

    return player[0];
  }

  function _convertToRelativeCoordinate(coordinate) { return coordinate + -Events.listen('CAMERA_OFFSET_X');}

  function _convertToBaseCoordinate(coordinate) { return coordinate + Events.listen('CAMERA_OFFSET_X');}

  function _updateDirection(state) {
    if (_getPlayerID() === state.id) {
      state.directionInt = 0;
      state.direction = (direction === 1) ? 'left' : 'right';
    } else {
      let direction = Math.sign(state.position.x - _getPlayerCoordindates().x);
      state.directionInt = direction;
      state.direction = (direction === 1) ? 'left' : 'right';
    }
  }

  function _distanceToPlayer(state) {
    let player = _getPlayerData();
    let entityCenter = state.position.x + state.hitbox.width / 2;
    let playerCenter = player.position.x + player.hitbox.width / 2;

    return Math.abs(entityCenter - playerCenter);
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

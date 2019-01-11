/* jshint esversion: 6 */
const Characters = (function() {
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
    _loopOverAttacks();
    _filterOutofBoundsAttacks();

    ENTITIES.forEach((cur, index) => {
      if (cur.id === _getPlayerID()) return;
      if (cur.health <= 0) ENTITIES.splice(index, 1);
    });

    ENTITIES.forEach(entity => entity.update(dt));
  }

  function render(ctx) {
    ENTITIES.forEach(entity => entity.render(ctx));

    Tests.drawAttacks(ctx, ATTACKS);
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
      isAttacking: false,
      attackCooldown: null,
      type: player.type,
      startPosition: {x: player.x, y: player.y},
      health: player.health || 1000,
      maxhealth: player.health || 1000,
      hitbox: {
        width: player.width,
        height: player.height
      },
      radius: 40,
      mass: player.mass || 200,
      direction: player.direction || 'right'
    };

    return Object.assign(state, ...[_entity(state), _render(state), _player(state)]);
  }

  function _createNpc(npc) {
    let state = {
      id: _generateRandomID(),
      isPlayerControlled: false,
      isAttacking: false,
      attackCooldown: null,
      type: npc.type,
      startPosition: {x: npc.x, y: npc.y},
      health: npc.health || 1000,
      maxhealth: npc.health || 1000,
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



  /********************************************************************************
  * @Entity ?
  * @
  ********************************************************************************/
  const _entity = (state) => ({
    position: new Vector(state.startPosition.x, state.startPosition.y),
    velocity: new Vector(),
    acceleration: new Vector(),
    verticalAcceleration: new Vector(),
    collision: new CollisionDetection(),

    update: (dt) => {
      _isHitByAttack(state);
      if (state.id === _getPlayerID()) _setPlayerDirection(state);
      if (state.id !== _getPlayerID()) state.animations.play(state.currentState, state.direction);

      document.getElementById("testsuite-amount-of-attackpoints").innerHTML = 'Active hit points: ' + ATTACKS.length;

      state.transitions[state.currentState].active();

      _updatePhysics(state, dt);
    },

    applyForce: (vector) => {
      let force = Vector.divide(vector, state.mass);
      state.acceleration.add(force);
    },

    applyVerticalForce: (vector) => {
      let force = Vector.divide(vector, state.mass);
      state.verticalAcceleration.add(force);
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

      ctx.drawImage(Assets.img('ui', 'healthbars'),
                    0,
                    180 - (Math.floor(_healthPercentage(state) * 10) * 18) - 18,
                    73,
                    18,
                    Math.round(_convertToRelativeCoordinate(state.position.x) + (state.hitbox.width / 2) - 37),
                    Math.round(state.position.y - 50),
                    73, 18);

      ctx.fillStyle = "orange";
      ctx.font = "bold 10px Verdana";
      ctx.fillText(Math.floor(state.health), _convertToRelativeCoordinate(state.position.x + (state.hitbox.width / 2) - 37), state.position.y - 52);

      Tests.drawHitbox(ctx, Math.round(_convertToRelativeCoordinate(state.position.x)), Math.round(state.position.y), state.hitbox.width, state.hitbox.height);
      Tests.drawCollisionPoints(ctx, true, state.collision.collisionPoints);
    }
  });




  /********************************************************************************
  * @Player Contains components for player controlled characters
  * @ Transitions
  * @ Actions: idle / run / jump / fall
  ********************************************************************************/
  const _player = (state) => ({
    transitions: {
      'idle': {
        active() { state.idle(); },
        run() { state.changeStateTo('run'); },
        jump() { state.changeStateTo('jump'); },
        fall() { state.changeStateTo('fall'); }
      },
      'run': {
        active() { state.run(); },
        idle() { state.changeStateTo('idle'); },
        jump() {state.changeStateTo('jump'); },
        fall() { state.changeStateTo('fall'); }
      },
      'jump': {
        active() { state.jump(); },
        fall() { state.changeStateTo('fall'); }
      },
      'fall': {
        active() { state.fall(); },
        idle() { state.changeStateTo('idle'); }
      }
    },

    idle: () => {
      if (Ctrls.isClicked('leftClick')) {
        state.animations.play('attack', state.direction);
        _attack(state);
      } else {
        state.animations.play('idle', state.direction);
      }

      if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) state.dispatch('run');
      if (Ctrls.isPressed('space')) state.dispatch('jump');
    },

    run: () => {
      if (Ctrls.isClicked('leftClick')) {
        state.animations.play('attack_run', state.direction);
        _attack(state);
      } else {
        state.animations.play('run', state.direction);
      }

      if (Ctrls.isPressed('space')) state.dispatch('jump');

      if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
        state.applyForce(new Vector(15000 * state.directionInt, 0));
      } else {
        if (state.velocity.x === 0) state.dispatch('idle');
      }
    },

    jump: () => {
      if (Ctrls.isClicked('leftClick')) {
        state.animations.play('attack_jump', state.direction);
        _attack(state);
      } else {
        state.animations.play('jump', state.direction);
      }

      if (state.collision.hit('y')) {
        state.applyVerticalForce(new Vector(0, -60000));
        state.dispatch('fall');
      } else {
        state.dispatch('fall');
      }
    },

    fall: () => {
      if (Ctrls.isClicked('leftClick')) {
        state.animations.play('attack_jump', state.direction);
        _attack(state);
      } else {
        state.animations.play('fall', state.direction);
      }

      if (!state.collision.hit('y')) {
        if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
          state.applyForce(new Vector(15000 * state.directionInt, 0));
        }
      } else {
        state.dispatch('idle');
      }
    }
  });



  /********************************************************************************
  * @Npc Contains components for NON player characters
  * @ Transitions
  * @ Actions: idle / run / attack
  ********************************************************************************/
  const _melee = (state) => ({
    transitions: {
      'idle': {
        active() { state.idle(); },
        run() { state.changeStateTo('run'); },
        attack() { state.changeStateTo('attack'); }
      },
      'run': {
        active() { state.run(); },
        idle() { state.changeStateTo('idle'); },
        attack() { state.changeStateTo('attack'); }
      },
      'attack': {
        active() { state.attack(); },
        idle() { state.changeStateTo('idle'); },
        run() { state.changeStateTo('run'); }
      }
    },

    idle: () => {
      if (Math.abs(state.velocity.x) > 0) state.dispatch('run');

      _updateDirection(state);

      let distance = _distanceToPlayer(state);

      if (distance > state.radius && distance < state.fov) state.dispatch('run');
      if (distance < state.radius) state.dispatch('attack');
    },

    run: () => {
      if (Math.abs(state.velocity.x) === 0) state.dispatch('idle');

      _updateDirection(state);

      let distance = _distanceToPlayer(state);

      if (distance > state.radius && distance < state.fov) state.applyForce(new Vector(15000 * -state.directionInt, 0));
      if (distance < state.radius) state.dispatch('attack');
    },

    attack: () => {
      _updateDirection(state);

      _attack(state);

      let distance = _distanceToPlayer(state);

      if (distance > state.radius) state.dispatch('idle');
    },
  });

  /********************************************************************************
  * @Combat
  * @
  * @
  ********************************************************************************/
  function _attack(state) {
    state.attackCooldown--;

    if (state.attackCooldown <= 0) {
      _createNewAttackPoint(state, 10, 5);
      _createNewAttackPoint(state, 10, 2.5);
      _createNewAttackPoint(state, 15, 2);

      state.attackCooldown = 10;
    }
  }

  function _createNewAttackPoint(state, time, speed) {
    let x = state.position.x;
    let y = state.position.y;
    let dir = state.direction;
    let radius = state.radius;

    let attackStartPosY = (y + state.hitbox.height) - radius;

    ATTACKS.push({
      id: state.id,
      position: new Vector(x + (state.hitbox.width / 2), attackStartPosY),
      time: time,
      speed: speed,
      direction: dir,
      radius: radius
    });
  }

  function _filterOutofBoundsAttacks() {

    let newArray = ATTACKS.filter(cur => {
      return (cur.time > 0);
    });

    ATTACKS = newArray;
  }

  function _loopOverAttacks() {
    ATTACKS.forEach(cur => {
      cur.time--;
      let speed = (cur.radius * 0.1) * cur.speed * ((cur.time) * 0.05);
      let x = (cur.direction === 'left') ? -speed : speed;
      let y = (cur.radius * 0.1) * cur.speed * ((11 - cur.time) * 0.05);
      cur.position.add(new Vector(x, y));
    });
  }

  function _isHitByAttack(state) {
    ATTACKS.filter(cur => {
      if (state.id === cur.id) return false;

      let collisionX = cur.position.x > state.position.x && cur.position.x < state.position.x + state.hitbox.width;
      let collisionY = cur.position.y > state.position.y && cur.position.y < state.position.y + state.hitbox.height;

      return collisionX && collisionY;
    })
    .forEach(cur => {
      if (_isCriticalHit()) _knockBack(state);
      state.health -= (_isCriticalHit()) ? 5 : 1;
    });
  }

  function _knockBack(state) {
    state.applyForce(new Vector(5000 * state.directionInt, -15000));
  }

  function _isCriticalHit() {
    let random = Math.floor(Math.random() * 100 + 1);

    return random < 5;
  }

  function _healthPercentage(state) {
    return state.health / state.maxhealth;
  }

  /*****************************
  * @Physics
  * @ Desc
  ******************************/
  function _updatePhysics(state, dt) {
    state.verticalAcceleration.multiply(0.88);

    if (Math.abs(state.verticalAcceleration.y) < FORCES.epsilon) state.verticalAcceleration.y = 0;
    state.acceleration.add(state.verticalAcceleration);

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
    let f = new Vector(0, (FORCES.gravity * state.mass));
    f.multiply(10);
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

  function _getPlayerPosition() {
    let player = ENTITIES.filter(cur => {
      return cur.id === _getPlayerID();
    });

    return {
      x: player[0].position.x,
      y: player[0].position.y
    };
  }

  function _getPlayerData() {
    let player = ENTITIES.filter(cur => {
      return cur.id === _getPlayerID();
    });

    return player[0];
  }

  function _setPlayerDirection(state) {
    if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
      state.directionInt = (Ctrls.lastKeyPressed('a', 'd')) ? -1 : 1;
      state.direction = (Ctrls.lastKeyPressed('a', 'd')) ? 'left' : 'right';
    }
  }

  function _convertToRelativeCoordinate(coordinate) { return coordinate + -Events.listen('CAMERA_OFFSET_X');}

  function _convertToBaseCoordinate(coordinate) { return coordinate + Events.listen('CAMERA_OFFSET_X');}

  function _updateDirection(state) {
    if (_getPlayerID() === state.id) {

    } else {
      let direction = Math.sign(state.position.x - _getPlayerPosition().x);
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

  function followCharacterWithCamera() {
    return {
      position: {
        x: _convertToRelativeCoordinate(_getPlayerPosition().x),
        y: _getPlayerPosition()
      },
      direction: _getPlayerData().direction,
      velocity: _getPlayerData().velocity
    };
  }

  /*****************************
  * PUBLIC
  ******************************/
  return {
    ENTITIES, ATTACKS,
    init, update, render, followCharacterWithCamera
  };
}());

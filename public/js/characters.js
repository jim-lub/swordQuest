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
    _updateAllAttackPoints();

    ENTITIES.forEach((state, index) => {
      if (_isActivePlayer(state.id)) return;
      if (state.health <= 0) ENTITIES.splice(index, 1);
    });

    ENTITIES.forEach(entity => entity.update(dt));
  }

  function render(ctx) {
    ENTITIES.forEach(entity => entity.render(ctx));

    DevTools.Visualizer.start('characterAttackPoints', ctx, {
      offsetX: Camera.convertXCoord(0),
      attackPoints: ATTACKS
    });
  }

  function init({player, npcs}) {
    npcs.forEach(npc => ENTITIES.push(_createNpc(npc)));
    player.forEach(player => ENTITIES.push(_createPlayer(player)));
  }

  function _createPlayer(player) {
    let state = {
      id: 0,
      isPlayerControlled: true,
      isAttacking: false,
      healCooldown: 0,
      type: player.type,
      startPosition: {x: player.x, y: player.y},
      health: player.health || 1000,
      maxhealth: player.health || 1000,
      damage: 0.5,
      critchance: 5,
      critdamage: 2.5,
      hitbox: {
        width: player.width,
        height: player.height
      },
      radius: 40,
      attackRadius: 40,
      mass: player.mass || 200,
      direction: player.direction || 'right'
    };

    return Object.assign(state, ...[_entity(state), _render(state), playerControlledCharacter(state), isMeleeCharacter(state), canBeHit(state)]);
  }

  function _createNpc(npc) {
    let state = {
      id: Utils.randomID(),
      isPlayerControlled: false,
      isAttacking: false,
      healCooldown: null,
      type: npc.type,
      startPosition: {x: npc.x, y: npc.y},
      health: npc.health || 1000,
      maxhealth: npc.health || 1000,
      damage: 1,
      critchance: 5,
      critdamage: 5,
      hitbox: {
        width: npc.width,
        height: npc.height
      },
      fov: 150,
      radius: npc.attackRadius || 75,
      attackRadius: npc.attackRadius || 75,
      mass: npc.mass || 400,
      direction: npc.direction || 'right'
    };

    return Object.assign(state, ...[_entity(state), _render(state), isNonPlayedControlledCharacter(state), isMeleeCharacter(state), canBeHit(state)]);
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
      state.isHit();
      if (_isActivePlayer(state.id)) _setPlayerDirection(state);
      if (_isActivePlayer(state.id) && state.healCooldown > 0) state.healCooldown--;
      if (!_isActivePlayer(state.id)) state.animations.play(state.currentState, state.direction);

      document.getElementById("testsuite-amount-of-attackpoints").innerHTML = 'Active hit points: ' + ATTACKS.length;

      state.transitions[state.currentState].active();
      if (Ctrls.isPressed('shift') && _isActivePlayer(state.id)) state.heal();

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

      if (action) action.apply(state);
    },

    changeStateTo: (transition) => {
      state.currentState = transition;
    }
  });

  const _render = (state) => ({
    animations: Animations.assign(state.type),

    render: (ctx) => {
      let currentFrame = state.animations.currentData;

      DevTools.Visualizer.start('characterFieldOfView', ctx, {
        x: Camera.convertXCoord(state.position.x),
        y: state.position.y,
        width: state.hitbox.width,
        height: state.hitbox.height,
        fov: state.fov
      });

      DevTools.Visualizer.start('characterAttackRadius', ctx, {
        x: Camera.convertXCoord(state.position.x),
        y: state.position.y,
        width: state.hitbox.width,
        height: state.hitbox.height,
        attackRadius: state.attackRadius
      });

      ctx.drawImage(state.animations.currentSprite,
                    currentFrame.sX,
                    currentFrame.sY,
                    currentFrame.sWidth,
                    currentFrame.sHeight,
                    Math.round(Camera.convertXCoord(state.position.x) + currentFrame.offsetX),
                    Math.round(state.position.y + currentFrame.offsetY),
                    currentFrame.sWidth, currentFrame.sHeight);

      let healthbarMultiplier = (_healthPercentage(state) < 1) ? _healthPercentage(state) : 0.99;

      ctx.drawImage(Assets.img('ui', 'healthbars'),
                    0,
                    180 - (Math.floor(healthbarMultiplier * 10 + 1) * 18),
                    73,
                    18,
                    Math.round(Camera.convertXCoord(state.position.x) + (state.hitbox.width / 2) - 37),
                    Math.round(state.position.y - 50),
                    73, 18);


      ctx.fillStyle = (state.id === _getPlayerID()) ? "lime" : "red";
      ctx.font = "bold 10px Verdana";
      ctx.fillText(Math.floor(state.health), Camera.convertXCoord(state.position.x + (state.hitbox.width / 2) - 36), state.position.y - 52);

      ctx.fillStyle = "silver";
      ctx.font = "bold 8px Verdana";
      if (state.id === _getPlayerID()) ctx.fillText(Math.floor(state.healCooldown / 60), Camera.convertXCoord(state.position.x + (state.hitbox.width / 2) - 31), state.position.y - 38);

      DevTools.Visualizer.start('characterHitbox', ctx, {
        x: Camera.convertXCoord(state.position.x),
        y: state.position.y,
        width: state.hitbox.width,
        height: state.hitbox.height
      });

      DevTools.Visualizer.start('characterCollisionPoints', ctx, {
        offsetX: Camera.convertXCoord(0),
        collisionPoints: state.collision.collisionPoints
      });
    }
  });




  /********************************************************************************
  * @Player Contains components for player controlled characters
  * @ Transitions
  * @ Actions: idle / run / jump / fall
  ********************************************************************************/
  const playerControlledCharacter = (state) => ({
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
        state.meleeAttack(state);
      } else {
        state.animations.play('idle', state.direction);
      }

      if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) state.dispatch('run');
      if (Ctrls.isPressed('space')) state.dispatch('jump');
    },

    run: () => {
      if (Ctrls.isClicked('leftClick')) {
        state.animations.play('attack_run', state.direction);
        state.meleeAttack(state);
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
        state.meleeAttack(state);
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
        state.meleeAttack(state);
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
    },

    heal: () => {
      if (state.healCooldown > 0 || state.health === state.maxhealth) return;

      state.healCooldown = 500;

      let healthToMaxHealth = Math.abs(state.health - state.maxhealth);
      let healFor = 500;

      state.health += (healthToMaxHealth <= healFor) ? healthToMaxHealth : healFor;

      Fx.create({
        type: 'energy_effect_2',
        position: state.position,
        offsetX: (state.hitbox.width / 2),
        offsetY: (state.hitbox.height / 2),
        id: Utils.randomID(),
        parentid: state.id,
        followCharacter: true
      });
    }
  });



  /********************************************************************************
  * @Npc Contains components for NON player characters
  * @ Transitions
  * @ Actions: idle / run / attack
  ********************************************************************************/
  const isNonPlayedControlledCharacter = (state) => ({
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

      if (distance > state.attackRadius && distance < state.fov) state.dispatch('run');
      if (distance < state.attackRadius) state.dispatch('attack');
    },

    run: () => {
      if (Math.abs(state.velocity.x) === 0) state.dispatch('idle');

      _updateDirection(state);

      let distance = _distanceToPlayer(state);

      if (distance > state.attackRadius && distance < state.fov) state.applyForce(new Vector(15000 * -state.directionInt, 0));
      if (distance < state.attackRadius) state.dispatch('attack');
    },

    attack: () => {
      _updateDirection(state);

      state.meleeAttack(state);

      let distance = _distanceToPlayer(state);

      if (distance > state.attackRadius) state.dispatch('idle');
    }
  });

  /********************************************************************************
  * @Combat
  * @ Emitting attack points
  * @
  ********************************************************************************/
  const canBeHit = (state) => ({
    isHit: () => {
      _filterAttackPointHits(state).forEach(hit => {
        state.health -= hit.damage;

        if (_isCriticalHit(hit.critchance)) {
          state.health -= hit.critdamage;

          _knockBack(state);

          Fx.create({
            type: 'explosion_effect_3',
            position: {
              x: state.position.x,
              y: state.position.y
            },
            offsetX: state.hitbox.width / 2,
            offsetY: state.hitbox.height -48,
            id: state.id,
            parentid: state.id
          });

          Fx.create({
            type: 'blood_effect_2',
            position: {
              x: hit.position.x,
              y: state.position.y
            },
            offsetX: 0,
            offsetY: Utils.randomNumberBetween(10, (state.hitbox.height - 10)),
            id: state.id,
            parentid: state.id
          });

          Fx.create({
            type: 'blood_effect_1',
            position: {
              x: hit.position.x,
              y: state.position.y
            },
            offsetX: 0,
            offsetY: Utils.randomNumberBetween(10, (state.hitbox.height - 10)),
            id: state.id + Utils.randomNumberBetween(1, 10),
            parentid: state.id
          });

        }
      });
    }
  });

  const isMeleeCharacter = (state) => ({
    meleeAttack: () => {
      if (_isActiveAttackFrame(state) && state.attackRadius > 70) _emitCircularAttackPoint(state, 4, 140, 170, 0.4);
      if (_isActiveAttackFrame(state)) _emitCircularAttackPoint(state, 6, 125, 170, 0.6);
      if (_isActiveAttackFrame(state) && state.attackRadius > 50) _emitCircularAttackPoint(state, 8, 110, 170, 0.8);
      if (_isActiveAttackFrame(state)) _emitCircularAttackPoint(state, 10, 100, 170, 1);

    }
  });

  function _isActiveAttackFrame(state) {
    return state.animations.activeAttackFrames.filter(i => {
      return i === state.animations.currentIndex;
    }).length > 0;
  }

  function _emitCircularAttackPoint(state, totalPoints, startAngle, endAngle, scaleModifier) {
    let x = state.position.x + (state.hitbox.width / 2);
    let y = state.position.y + state.hitbox.height;

    ATTACKS.push({
      id: Utils.randomID(),
      parentid: state.id,
      type: "circular",
      origin: new Vector(x, y),
      angle: (startAngle / 180) * Math.PI,
      step: ((endAngle / 180) - (startAngle / 180)) * Math.PI / totalPoints,
      maxAngle: (endAngle / 180) * Math.PI,
      position: new Vector(x, y),
      direction: state.direction,
      radius: state.attackRadius * scaleModifier,
      damage: state.damage,
      critchance: state.critchance,
      critdamage: state.critdamage
    });
  }

  /********************************************************************************
  * @Combat
  * @ Managing attack points
  * @
  ********************************************************************************/
  function _updateAllAttackPoints() {
    ATTACKS = ATTACKS.filter(cur => {
      return (cur.angle < cur.maxAngle);
    });

    ATTACKS.forEach(point => {
      if (point.type === 'circular') _updateCircularPattern(point);
    });
  }

  function _updateCircularPattern(point) {
    let modifiedRadius = (point.direction === 'left') ? point.radius : -point.radius;

    let x = point.origin.x + (modifiedRadius * Math.cos(point.angle));
    let y = point.origin.y - point.radius * Math.sin(point.angle);

    point.position = new Vector(x, y);
    point.angle += point.step;
  }

  function _filterAttackPointHits(state) {
    return ATTACKS.filter(point => {
      return _attackPointCollision(state, point) && (state.id !== point.parentid);
    });
  }

  function _attackPointCollision(state, point) {
    let collisionX = point.position.x >= state.position.x && point.position.x < state.position.x + state.hitbox.width;
    let collisionY = point.position.y >= state.position.y && point.position.y < state.position.y + state.hitbox.height;

    return (collisionX && collisionY);
  }

  function _knockBack(state) {
    state.applyForce(new Vector(5000 * state.directionInt, -15000));
  }

  function _isCriticalHit(critchance) {
    return Math.floor(Math.random() * 100 + 1) < critchance;
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
  function _isActivePlayer(id) {
    return id === _getPlayerID();
  }

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

  function _getCharacterPositionById(id) {
    let character = ENTITIES.filter(cur => {
      return cur.id === id;
    });

    return {
      x: character[0].position.x,
      y: character[0].position.y
    };
  }

  function publishCharacterPosition(id) {
    return _getCharacterPositionById(id);
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

  function followCharacterWithCamera() {
    return {
      position: {
        x: Camera.convertXCoord(_getPlayerPosition().x),
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
    init, update, render, followCharacterWithCamera,
    publishCharacterPosition
  };
}());

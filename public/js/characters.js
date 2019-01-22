/* jshint esversion: 6 */
const Characters = (function() {
  const Ctrls = new Controls();

  function create({type, isPlayerControlled, spawnPosition}) {
    let state = {
      type,
      isPlayerControlled: isPlayerControlled || false,
      spawnPosition: {
        x: spawnPosition.x,
        y: spawnPosition.y
      }
    };

    if (type === 'hero') {
      return Object.assign(state,
            ...[hasDefaults(state), canRender(state), canBeHit(state), canBeHealed(state), isHero(state), cooldownManager
            (state)],
            ...[canIdle(state), canRun(state), canJump(state), canAttack(state)],
            ...[Abilities.canSwordSlash(state), Abilities.canHeal(state)]);
    }

    if (type === 'hellishsmith') {
      return Object.assign(state,
            ...[hasDefaults(state), canRender(state), canBeHit(state), isHellishSmith(state)],
            ...[canIdle(state), canRun(state), canAttack(state)],
            ...[Abilities.canSwordSlash(state)]);
    }

    if (type === 'swordknight') {
      return Object.assign(state,
            ...[hasDefaults(state), canRender(state), canBeHit(state), isSwordKnight(state)],
            ...[canIdle(state), canRun(state), canAttack(state)],
            ...[Abilities.canSwordSlash(state)]);
    }
  }


  /********************************************************************************
  * @ Defaults
  * -------------------------------------------------------------------------------
  * @hasDefaults: contains variables and function that are applied to every character
  * - Dispatch: checks if action is a possible transition; switches if true
  ********************************************************************************/
  const hasDefaults = (state) => ({
    id: Utils.randomID(),

    position: new Vector(state.spawnPosition.x, state.spawnPosition.y),
    velocity: new Vector(),
    acceleration: new Vector(),
    verticalAcceleration: new Vector(),

    direction: state.direction || 'left',
    directionInt: state.directionInt || -1,

    collision: new CollisionDetection(),

    animations: Animations.assign(state.type),

    update: (dt) => {
      _updateDirection(state);
      _updatePhysics(state, dt);

      if (state.cooldown) state.cooldown();
      state.checkForHits();

      if (state.checkForHeals) state.checkForHeals();
      if (!state.isPlayerControlled) state.animations.play(state.currentState, state.direction);

      state[state.currentState](); // Call current state function
    },

    currentState: 'idle', // Default state for characters is `idle`

    dispatch: (actionName) => {
      const action = state.transitions[state.currentState][actionName];

      if (action) action.apply(state);
    },

    changeStateTo: (transition) => {
      state.currentState = transition;
    },

    applyForce: (vector) => {
      let force = Vector.divide(vector, state.mass);
      state.acceleration.add(force);
    },

    applyVerticalForce: (vector) => {
      let force = Vector.divide(vector, state.mass);
      state.verticalAcceleration.add(force);
    },
  });


  /********************************************************************************
  * @ Types - Type specific defaults & transitions
  * -------------------------------------------------------------------------------
  * @Hero: Default player character; idle - run - jump - fall - attack
  * @HellishSmith: Enemy character; idle - run - attack
  * @SwordKnight: Enemy character; idle - run - attack
  ********************************************************************************/
  const isHero = (state) => ({
    health: {
      current: 1000,
      max: 1500
    },
    damage: {
      base: 1,
      criticalHitChance: 5,
      criticalHitDamage: 5
    },
    hitbox: {
      width: 20,
      height: 35
    },
    speed: 15000,
    mass: 100,
    attackRadius: 60,

    transitions: {
      'idle': {
        run() { state.changeStateTo('run'); },
        jump() { state.changeStateTo('jump'); },
        fall() { state.changeStateTo('fall'); }
      },
      'run': {
        idle() { state.changeStateTo('idle'); },
        jump() {state.changeStateTo('jump'); },
        fall() { state.changeStateTo('fall'); }
      },
      'jump': {
        fall() { state.changeStateTo('fall'); }
      },
      'fall': {
        idle() { state.changeStateTo('idle'); }
      }
    }
  });

  const isHellishSmith = (state) => ({
    health: {
      current: 2500,
      max: 2500
    },
    damage: {
      base: 4,
      criticalHitChance: 10.5,
      criticalHitDamage: 10
    },
    hitbox: {
      width: 40,
      height: 75
    },
    speed: 25000,
    mass: 1000,
    fov: 150,
    attackRadius: 75,

    transitions: {
      'idle': {
        run() { state.changeStateTo('run'); },
        attack() { state.changeStateTo('attack'); }
      },
      'run': {
        idle() { state.changeStateTo('idle'); },
        attack() { state.changeStateTo('attack'); }
      },
      'attack': {
        idle() { state.changeStateTo('idle'); },
        run() { state.changeStateTo('run'); }
      }
    }
  });

  const isSwordKnight = (state) => ({
    health: {
      current: 1500,
      max: 1500
    },
    damage: {
      base: 3,
      criticalHitChance: 5.5,
      criticalHitDamage: 5
    },
    hitbox: {
      width: 40,
      height: 65
    },
    speed: 25000,
    mass: 700,
    fov: 170,
    attackRadius: 85,

    transitions: {
      'idle': {
        run() { state.changeStateTo('run'); },
        attack() { state.changeStateTo('attack'); }
      },
      'run': {
        idle() { state.changeStateTo('idle'); },
        attack() { state.changeStateTo('attack'); }
      },
      'attack': {
        idle() { state.changeStateTo('idle'); },
        run() { state.changeStateTo('run'); }
      }
    }
  });


  /********************************************************************************
  * @ Actions
  * -------------------------------------------------------------------------------
  * @Idle: -
  * @Run: -
  * @Jump / @Fall: -
  * @Attack: -
  ********************************************************************************/
  const canIdle = (state) => ({
    idle: () => {
      if (state.isPlayerControlled) {
        if (Ctrls.isPressed('shift')) state.heal();

        if (Ctrls.isClicked('leftClick')) {
          state.animations.play('attack', state.direction);
          state.attack();
        } else {
          state.animations.play('idle', state.direction);
        }

        if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) state.dispatch('run');
        if (Ctrls.isPressed('space')) state.dispatch('jump');

      } else {

        if (Math.abs(state.velocity.x) > 0) state.dispatch('run');

        let distance = _distanceToPlayer(state);

        if (distance > state.attackRadius && distance < state.fov) state.dispatch('run');
        if (distance < state.attackRadius) state.dispatch('attack');

      }
    }
  });

  const canRun = (state) => ({
    run: () => {
      if (state.isPlayerControlled) {
        if (Ctrls.isPressed('shift')) state.heal();

        if (Ctrls.isClicked('leftClick')) {
          state.animations.play('attack_run', state.direction);
          state.attack();
        } else {
          state.animations.play('run', state.direction);
        }

        if (Ctrls.isPressed('space')) state.dispatch('jump');

        if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
          state.applyForce(new Vector(state.speed * state.directionInt, 0));
        } else {
          if (state.velocity.x === 0) state.dispatch('idle');
        }

      } else {

        if (Math.abs(state.velocity.x) === 0) state.dispatch('idle');

        let distance = _distanceToPlayer(state);

        if (distance > state.attackRadius && distance < state.fov) state.applyForce(new Vector(state.speed * -state.directionInt, 0));
        if (distance < state.attackRadius) state.dispatch('attack');

      }
    }
  });

  const canJump = (state) => ({
    jump: () => {
      if (state.isPlayerControlled) {
        if (Ctrls.isPressed('shift')) state.heal();

        if (Ctrls.isClicked('leftClick')) {
          state.animations.play('attack_jump', state.direction);
          state.attack();
        } else {
          state.animations.play('jump', state.direction);
        }

        if (state.collision.hit('y')) {
          state.applyVerticalForce(new Vector(0, -60000));
          state.dispatch('fall');
        } else {
          state.dispatch('fall');
        }

      } else {
        // Currently not avaible for non-player characters
      }
    },

    fall: () => {
      if (state.isPlayerControlled) {
        if (Ctrls.isPressed('shift')) state.heal();

        if (Ctrls.isClicked('leftClick')) {
          state.animations.play('attack_jump', state.direction);
          state.attack();
        } else {
          state.animations.play('fall', state.direction);
        }

        if (!state.collision.hit('y')) {
          if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) state.applyForce(new Vector(15000 * state.directionInt, 0));
        } else {
          state.dispatch('idle');
        }

      } else {
          // Currently not avaible for non-player characters
      }
    }
  });

  const canAttack = (state) => ({
    attack: () => {
      if (state.isPlayerControlled) {
        state.swordSlash();
      } else {
        let distance = _distanceToPlayer(state);
        if (distance > state.attackRadius) state.dispatch('idle');

        state.swordSlash();
      }
    }
  });

  /********************************************************************************
  * @ Combat
  * -------------------------------------------------------------------------------
  * @canBeHit: -
  * @canBeHealed: -
  ********************************************************************************/
  const canBeHit = (state) => ({
    checkForHits: () => {
      let hits = Combat.filterAttackPoints(state);

      if (hits) {
        hits.forEach(hit => {
          state.health.current -= hit.damage;

          if (hit.isCrit) {
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
                id: state.id,
                parentid: state.id
            });
          }
        });
      }
    }
  });

  const canBeHealed = (state) => ({
    checkForHeals: () => {
      let heals = Combat.filterHealPoints(state);

      if (state.health.current <= state.health.max && heals) {
        heals.forEach(heal => {
          state.health.current += heal.heal;

          if (heal.isCrit) {
            // insert critical heal effects
          }
        });
      }
    }
  });

  const cooldownManager = (state) => ({
    cooldown: () => {
      if (state.heal && state.healCooldown && state.healCooldown.current > 0) {
        state.healCooldown.current--;
      }
    }
  });


  /********************************************************************************
  * @ Utility
  * -------------------------------------------------------------------------------
  * @_updateDirection: -
  * @_distanceToPlayer: -
  * @_getPlayerData: -
  * @_healthPercentage: -
  * @_getEntities: -
  ********************************************************************************/
  function _updateDirection(state) {
    if (state.isPlayerControlled) {
      if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
        state.directionInt = (Ctrls.lastKeyPressed('a', 'd')) ? -1 : 1;
        state.direction = (Ctrls.lastKeyPressed('a', 'd')) ? 'left' : 'right';
      }
    } else {
      if (_distanceToPlayer(state) < state.fov) {
        let direction = Math.sign(state.position.x - _getPlayerData().position.x);
        state.directionInt = direction;
        state.direction = (direction === 1) ? 'left' : 'right';
      }
    }
  }

  function _distanceToPlayer(state) {
    let player = _getPlayerData();

    if (player) {
      let entityCenter = state.position.x + state.hitbox.width / 2;
      let playerCenter = player.position.x + player.hitbox.width / 2;

      return Math.abs(entityCenter - playerCenter);
    } else {
      return 0;
    }
  }

  function _getPlayerData() {
    let player = _getEntities().filter(state => state.isPlayerControlled);

    if (player && player.length > 0) {
      // if active player return data
      return player[0];
    } else {
      // if no active player return an empty object with zero'd data
      return {
        position: {x: 0,y: 0},
        hitbox: {width: 0,height: 0}
      };
    }
  }

  function _healthPercentage(state) {
    return state.health.current / state.health.max;
}

  function _getEntities() {
    return Entities.getAllEntities();
  }


  /********************************************************************************
  * @Render
  * @ MOVE TO SEPARATE FILE
  * @ MOVE TO SEPARATE FILE
  * @ MOVE TO SEPARATE FILE
  ********************************************************************************/
  const canRender = (state) => ({
    render: (ctx) => {
      let currentFrame = state.animations.currentData;

      DevTools.Visualizer.start('characterFieldOfView', ctx, {
        x: Camera.convertXCoord(state.position.x),
        y: state.position.y,
        width: state.hitbox.width,
        height: state.hitbox.height,
        fov: state.fov || 0
      });

      DevTools.Visualizer.start('characterAttackRadius', ctx, {
        x: Camera.convertXCoord(state.position.x),
        y: state.position.y,
        width: state.hitbox.width,
        height: state.hitbox.height,
        attackRadius: state.attackRadius || 0
      });

      // Draw characters
      ctx.drawImage(state.animations.currentSprite,
                    currentFrame.sX,
                    currentFrame.sY,
                    currentFrame.sWidth,
                    currentFrame.sHeight,
                    Math.round(Camera.convertXCoord(state.position.x) + currentFrame.offsetX),
                    Math.round(state.position.y + currentFrame.offsetY),
                    currentFrame.sWidth, currentFrame.sHeight);

      // Draw healthbar
      let healthbarMultiplier = (_healthPercentage(state) < 1) ? _healthPercentage(state) : 0.99;
      ctx.drawImage(Assets.img('ui', 'healthbars'),
                    0,
                    180 - (Math.floor(healthbarMultiplier * 10 + 1) * 18),
                    73,
                    18,
                    Math.round(Camera.convertXCoord(state.position.x) + (state.hitbox.width / 2) - 37),
                    Math.round(state.position.y - 50),
                    73, 18);

      // Draw health
      ctx.fillStyle = (state.isPlayerControlled) ? "lime" : "red";
      ctx.font = "bold 10px Verdana";
      ctx.fillText(Math.floor(state.health.current), Camera.convertXCoord(state.position.x + (state.hitbox.width / 2) - 36), state.position.y - 52);

      // Draw heal cooldown
      if (state.healCooldown) {
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Verdana";
        ctx.fillText(Math.floor(state.healCooldown.current / 60), Camera.convertXCoord(state.position.x + (state.hitbox.width / 2) + 36), state.position.y - 52);
      }


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


  /*****************************
  * @Physics
  * @ TEMPORARY FUNCTIONS UNTIL GAMELOOP REBUILD IS COMPLETE
  * @ TEMPORARY FUNCTIONS UNTIL GAMELOOP REBUILD IS COMPLETE
  * @ TEMPORARY FUNCTIONS UNTIL GAMELOOP REBUILD IS COMPLETE
  ******************************/
  const FORCES = {
    epsilon: 0.1,
    gravity: 9.81,
    friction: -0.99,
    drag: -0.05
  };

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


  return { create };
}());

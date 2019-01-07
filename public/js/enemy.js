/* jshint esversion: 6 */
const Enemy = (function() {
  const FORCES = {
    epsilon: 0.1,
    gravity: 9.81,
    friction: -0.99,
    drag: -0.05
  };

  function _gravity(state) {
    let f = new Vector(0, (FORCES.gravity * (state.mass * 12)));
    return f;
  }

  function _friction(state) {
    let f = state.vel.clone();
    f.normalize();
    f.multiply(FORCES.friction);
    return f;
  }

  function _drag(state) {
    let f = state.vel.clone();
    let speed = state.vel.mag();
    f.normalize();
    f.multiply(FORCES.drag * speed * speed);
    return f;
  }

  function _apply(state, v) {
    let f = Vector.divide(v, state.mass);
    state.acc.add(f);
  }

  function _drawHealth(ctx, health, x, y) {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText(health, x, y);
    ctx.restore();
  }

  const build = (state) => {
    return Object.assign(state, ...[entity(state), render(state)]);
  };

  const render = (state) => ({
    animations: Animations.assign(state.type),
    render: (ctx) => {
      let currentFrame = state.animations.currentData;

      Tests.drawFov(ctx, Math.round(-Events.listen('CAMERA_OFFSET_X') + state.pos.x), Math.round(state.pos.y), state.hitbox.width, state.hitbox.height, state.fov);
      Tests.drawAttackRadius(ctx, Math.round(-Events.listen('CAMERA_OFFSET_X') + state.pos.x), Math.round(state.pos.y), state.hitbox.width, state.hitbox.height, state.radius);
      _drawHealth(ctx, state.health, Math.round(-Events.listen('CAMERA_OFFSET_X') + state.pos.x),Math.round(state.pos.y - 30));

      ctx.drawImage(state.animations.currentSprite,
                    currentFrame.sX,
                    currentFrame.sY,
                    currentFrame.sWidth,
                    currentFrame.sHeight,
                    Math.round(-Events.listen('CAMERA_OFFSET_X') + state.pos.x + currentFrame.offsetX),
                    Math.round(state.pos.y + currentFrame.offsetY),
                    currentFrame.sWidth, currentFrame.sHeight);

      Tests.drawHitbox(ctx, Math.round(-Events.listen('CAMERA_OFFSET_X') + state.pos.x), Math.round(state.pos.y), state.hitbox.width, state.hitbox.height);
      Tests.drawCollisionPoints(ctx, true, state.collision.collisionPoints);
    }
  });

  const entity = (state) => ({
    pos: new Vector(state.x, state.y),
    vel: new Vector(0, 0),
    acc: new Vector(0, 0),
    dir: 'right',
    health: 100,
    cooldown: 0,
    hitbox: {
      width: state.width,
      height: state.height
    },
    collision: new CollisionDetection(),

    update: (dt) => {
      state.transitions[state.currentState].active();
      state.animations.play(state.currentState, state.dir);
      state.isHitByPlayer();

      _apply(state, _gravity(state));
      _apply(state, _friction(state));
      _apply(state, _drag(state));

      state.vel.add(state.acc);

      if (Math.abs(state.vel.x) < FORCES.epsilon) state.vel.x = 0;
      if (Math.abs(state.vel.y) < FORCES.epsilon) state.vel.y = 0;

      state.collision.update(state.id, state.pos, Vector.multiply(state.vel, dt), state.hitbox.width, state.hitbox.height);

      if (state.collision.hit('y')) state.vel.set(state.vel.x, 0);
      if (state.collision.hit('x')) state.vel.set(0, state.vel.y);

      state.vel.multiply(dt);
      state.pos.add(state.vel);
      state.acc.multiply(0);
    },

    dispatch: (actionName) => {
      const actions = state.transitions[state.currentState];
      const action = state.transitions[state.currentState][actionName];

      if (action) {
        action.apply(state);
      }
    },

    changeStateTo: (transition) => {
      state.currentState = transition;
    },

    currentState: 'idle',

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
      if (Math.abs(state.vel.x) > 0) state.dispatch('run');

      state.distanceToPlayer();

      if (state.distance > state.radius && state.distance < state.fov) state.dispatch('run');
      if (state.distance < state.radius) state.dispatch('attack');
    },

    run: () => {
      if (Math.abs(state.vel.x) === 0) state.dispatch('idle');

      state.setDirection();
      state.distanceToPlayer();

      if (state.distance > state.radius && state.distance < state.fov) state.apply(new Vector(15000 * -state.dirInt, 0));
      if (state.distance < state.radius) state.dispatch('attack');
    },

    attack: () => {
      state.setDirection();
      state.distanceToPlayer();
      if (state.distance > state.radius) state.dispatch('idle');
    },

    isHitByPlayer: () => {
      state.cooldown--;
      if (state.cooldown > 0) return;
      let attack = Events.listen('PLAYER_ATTACK');
      if (attack.range === 0) return;

      if (state.distance < attack.range && state.dir !== attack.direction) {
        if (state.isCriticalHit(attack.critchance)) {
          state.apply(new Vector(attack.knockbackForce * state.dirInt, 0));
          state.health -= attack.damage * state.calculateDamage();
        }
        state.health -= attack.damage * state.calculateDamage();
        state.cooldown = attack.cooldown;
      }
      if (state.health <= 0) {
        // Dead
      }
    },

    calculateDamage: () => {
      let rand = Math.floor((Math.random() * 10) + 1);

      return rand / 5;
    },

    isCriticalHit: (critchance) => {
      let rand = Math.floor((Math.random() * 100) + 1);

      return rand < critchance;
    },

    apply: (v) => {
      let f = Vector.divide(v, state.mass);
      state.acc.add(f);
    },

    setDirection: () => {
      let direction = Math.sign((state.pos.x - (Events.listen('PLAYER_POSITION').x + Events.listen('CAMERA_OFFSET_X'))) + (Events.listen('PLAYER_HITBOX').width / 2));
      state.dirInt = direction;
      state.dir = (direction === 1) ? 'left' : 'right';
    },

    distanceToPlayer: () => {
      let entityCenter = state.pos.x + state.hitbox.width / 2;
      let playerCenter = (Events.listen('PLAYER_POSITION').x + Events.listen('CAMERA_OFFSET_X')) + (Events.listen('PLAYER_HITBOX').width / 2);
      state.distance = Math.abs(entityCenter - playerCenter);
    }
  });

  return {
    build
  };
}());

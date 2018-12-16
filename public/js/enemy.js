/* jshint esversion: 6 */
const Enemy = (function() {
  const F = {
    epsilon: 0.1,
    gravity: 9.81,
    friction: -0.99,
    drag: -0.05
  };

  function _gravity(state) {
    let f = new Vector(0, (F.gravity * (state.mass * 12)));
    return f;
  }

  function _friction(state) {
    let f = state.vel.clone();
    f.normalize();
    f.multiply(F.friction);
    return f;
  }

  function _drag(state) {
    let f = state.vel.clone();
    let speed = state.vel.mag();
    f.normalize();
    f.multiply(F.drag * speed * speed);
    return f;
  }

  function _apply(state, v) {
    let f = Vector.divide(v, state.mass);
    state.acc.add(f);
  }

  const build = (state) => {
    return Object.assign(state, ...[entity(state), render(state)]);
  };

  const render = (state) => ({
    animations: Animations.assign(state.type),
    render: (ctx) => {
      let currentFrame = state.animations.currentData;
      ctx.drawImage(state.animations.currentSprite,
                    currentFrame.sX,
                    currentFrame.sY,
                    currentFrame.sWidth,
                    currentFrame.sHeight,
                    Math.round(-Events.listen('CAMERA_OFFSET_X') + state.pos.x + currentFrame.offsetX),
                    Math.round(state.pos.y - 10 + currentFrame.offsetY),
                    currentFrame.sWidth, currentFrame.sHeight);
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = 'red';
      // ctx.fillRect(Math.round(-Events.listen('CAMERA_OFFSET_X') + state.pos.x + currentFrame.offsetX), Math.round(state.pos.y - 10 + currentFrame.offsetY), currentFrame.sWidth, currentFrame.sHeight);
      ctx.restore();
    }
  });

  const entity = (state) => ({
    pos: new Vector(state.x, state.y),
    vel: new Vector(0, 0),
    acc: new Vector(0, 0),
    dir: 'right',
    collision: new CollisionDetection(),
    apply: (v) => {
      let f = Vector.divide(v, state.mass);
      state.acc.add(f);
    },
    update: (dt) => {
      state.transitions[state.currentState].active();
      state.animations.play(state.currentState, state.dir);
      
      _apply(state, _gravity(state));
      _apply(state, _friction(state));
      _apply(state, _drag(state));

      state.vel.add(state.acc);

      if (Math.abs(state.vel.x) < F.epsilon) state.vel.x = 0;
      if (Math.abs(state.vel.y) < F.epsilon) state.vel.y = 0;

      state.collision.update(state.pos, Vector.multiply(state.vel, dt), state.width, state.height);

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
      let distance = Math.abs(state.pos.x - (Events.listen('PLAYER_POSITION').x + Events.listen('CAMERA_OFFSET_X')));
      if (distance < 100) state.dispatch('attack');
    },
    run: () => {
      if (Math.abs(state.vel.x) === 0) state.dispatch('idle');
      let distance = Math.abs(state.pos.x - (Events.listen('PLAYER_POSITION').x + Events.listen('CAMERA_OFFSET_X')));
      if (distance < 100) state.dispatch('attack');
    },
    attack: () => {
      let direction = Math.sign(state.pos.x - (Events.listen('PLAYER_POSITION').x + Events.listen('CAMERA_OFFSET_X')));
      let distance = Math.abs(state.pos.x - (Events.listen('PLAYER_POSITION').x + Events.listen('CAMERA_OFFSET_X')));

      state.dir = (direction === 1) ? 'left' : 'right';
      if (distance > 100) state.dispatch('idle');
    }
  });

  return {
    build
  };
}());

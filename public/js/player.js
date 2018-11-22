/* jshint esversion: 6 */
const Player = (function({Animations, Collision}) {
  const self = {
    pos: {
      x: 150,
      y: 150
    },
    direction: 'right',
    motion: {
      hor: 0,
      ver: 0
    },
    hitbox: {
      offsetX: 12,
      offsetY: 35,
      width: 32,
      height: 35
    },
    DEFAULTS: {
      width: 90,
      height: 70,
      run: {
        acceleration: 0.35,
        max: 4
      },
      jump: { acceleration: 3 },
      fall: { acceleration: 0.25 },
      friction: 0.97,
      epsilon: 0.1
    },
    jump: false,
    falling: false,
    touchingFloor: true
  };

  function _setPlayerDirection() {
    if (_isPressed('a') || _isPressed('d')) {
      self.direction = (Events.listen('ctrls_key_a').timestamp.keyDown > Events.listen('ctrls_key_d').timestamp.keyDown) ? 'left' : 'right';
    }
  }

  function _isPressed(key) {
    return Events.listen(`ctrls_key_${key}`).active;
  }

  function _isClicked(btn) {
    return Events.listen(`ctrls_mouse_${btn}`).active;
  }

  function _limitHorizontalSpeed() {
    self.motion.hor *= self.DEFAULTS.friction * self.DEFAULTS.friction;

    if (Math.abs(self.motion.hor) > self.DEFAULTS.run.max) {
      if (self.direction === 'left') self.motion.hor = -self.DEFAULTS.run.max;
      if (self.direction === 'right') self.motion.hor = self.DEFAULTS.run.max;
    }
  }

  const _machine = {
    dispatch(actionName, ...data) {
      const actions = this.transitions[this.state];
      const action = this.transitions[this.state][actionName];

      if (action) {
        action.apply(_machine);
      }
    },
    changeStateTo(newState) {
      this.state = newState;
    },

    state: 'idle',

    transitions: {
      'idle': {
        active() { _idle(); },
        run() { this.changeStateTo('run'); },
        jump() { this.changeStateTo('jump'); },
        fall() { this.changeStateTo('fall'); },
        attack() {}
      },
      'run': {
        active() { _run(); },
        idle() { this.changeStateTo('idle'); },
        jump() { this.changeStateTo('jump'); },
        fall() { this.changeStateTo('fall'); },
        attack() {}
      },
      'jump': {
        active() { _jump(); },
        fall() { this.changeStateTo('fall'); },
        attack() {}
      },
      'fall': {
        active() { _fall(); },
        idle() { this.changeStateTo('idle'); },
        attack() {}
      }
    }
  };

  function _idle() {
    if (_isClicked('leftClick')) {
      Animations.play('attack', self.direction);
    } else {
      Animations.play('idle', self.direction);
    }

    if (_isPressed('a') || _isPressed('d')) _machine.dispatch('run');
    if (_isPressed('space')) _machine.dispatch('jump');
  }

  function _run() {
    if (_isClicked('leftClick')) {
      Animations.play('attack_run', self.direction);
    } else {
      Animations.play('run', self.direction);
    }

    if (_isPressed('space')) _machine.dispatch('jump');

    if (_isPressed('a') || _isPressed('d')) {
      if (self.direction === 'right') self.motion.hor += self.DEFAULTS.run.acceleration * self.DEFAULTS.friction;
      if (self.direction === 'left') self.motion.hor -= self.DEFAULTS.run.acceleration * self.DEFAULTS.friction;
    } else {
      if (self.motion.hor === 0) _machine.dispatch('idle');
    }
  }

  function _jump() {
    if (_isClicked('leftClick')) {
      Animations.play('attack_jump', self.direction);
    } else {
      Animations.play('jump', self.direction);
    }

    if (Collision.hit('floor')) {
      self.motion.ver -= self.DEFAULTS.jump.acceleration;
    } else {
      _machine.dispatch('idle');
    }
  }

  function _fall() {
    if (_isClicked('leftClick')) {
      Animations.play('attack_jump', self.direction);
    } else {
      Animations.play('fall', self.direction);
    }
    if (!Collision.hit('floor')) {
      self.motion.ver += self.DEFAULTS.fall.acceleration;
    } else {
      _machine.dispatch('idle');
    }
  }

  function _attack() {

  }

  function init() {
    Animations.init();
  }

  function update() {
    _setPlayerDirection();

    _machine.transitions[_machine.state].active();

    Collision.listen({
      player: {
        pos: self.pos, motion: self.motion, hitbox: self.hitbox, size: {width: self.DEFAULTS.width, height: self.DEFAULTS.height}
      },
      static_tiles: Events.listen('world_static_tiles')
    });

    if (!Collision.hit('floor') && _machine.state !== 'fall') _machine.dispatch('fall');

    _limitHorizontalSpeed();

    if (Math.abs(self.motion.hor) < self.DEFAULTS.epsilon) self.motion.hor = 0;
    if (Math.abs(self.motion.ver) < self.DEFAULTS.epsilon) self.motion.ver = 0;

    if (Collision.hit('x')) self.motion.hor = 0;
    if (Collision.hit('y')) self.motion.ver = 0;

    if (!Collision.hit('x')) self.pos.x += self.motion.hor;
    if (!Collision.hit('y')) self.pos.y += self.motion.ver;
  }

  function render(ctx) {
    Collision.drawHitBox(ctx);
    Collision.drawCollisionPoints(ctx);

    let currentFrame = Animations.getRenderData();
    ctx.drawImage(currentFrame.sprite,
                  currentFrame.data.sX,
                  currentFrame.data.sY,
                  currentFrame.data.sWidth,
                  currentFrame.data.sHeight,
                  Math.round(self.pos.x + currentFrame.data.offsetX),
                  Math.round(self.pos.y + currentFrame.data.offsetY),
                  currentFrame.data.sWidth, currentFrame.data.sHeight);
  }

  return {
    init,
    update,
    render
  };
}({
  Animations: new PlayerAnimations(),
  Collision: new CollisionDetection()
}));

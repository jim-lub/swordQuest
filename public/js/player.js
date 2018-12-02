/* jshint esversion: 6 */
const Player = (function() {
  const self = {
    direction: 'right'
  };

  const DEFAULTS = {
    pos: {x: 150, y: 250},
    width: 90,
    height: 70,
    mass: 100
  };

  const HITBOX = {
    offsetX: 12,
    offsetY: 35,
    width: 32,
    height: 35
  };

  const Self = new Entity({
    x: DEFAULTS.pos.x,
    y: DEFAULTS.pos.y,
    width: HITBOX.width,
    height: HITBOX.height,
    mass: DEFAULTS.mass
  });
  const Collision = Self.collision;
  const Ctrls = new Controls();
  const Animations = new PlayerAnimations();

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
    if (Ctrls.isClicked('leftClick')) {
      Animations.play('attack', self.direction);
    } else {
      Animations.play('idle', self.direction);
    }

    if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) _machine.dispatch('run');
    if (Ctrls.isPressed('space')) _machine.dispatch('jump');
  }

  function _run() {
    if (Ctrls.isClicked('leftClick')) {
      Animations.play('attack_run', self.direction);
    } else {
      Animations.play('run', self.direction);
    }

    if (Ctrls.isPressed('space')) _machine.dispatch('jump');

    if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
      if (self.direction === 'left') Self.apply(new Vector(-10000, 0));
      if (self.direction === 'right') Self.apply(new Vector(10000, 0));
    } else {
      if (Self.velocity.x === 0) _machine.dispatch('idle');
    }
  }

  function _jump() {
    if (Ctrls.isClicked('leftClick')) {
      Animations.play('attack_jump', self.direction);
    } else {
      Animations.play('jump', self.direction);
    }

    if (Collision.hit('y')) {
      Self.jump();
    } else {
      _machine.dispatch('idle');
    }
  }

  function _fall() {
    if (Ctrls.isClicked('leftClick')) {
      Animations.play('attack_jump', self.direction);
    } else {
      Animations.play('fall', self.direction);
    }
    if (!Collision.hit('y')) {
      if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
        if (self.direction === 'left') Self.apply(new Vector(-5000, 0));
        if (self.direction === 'right') Self.apply(new Vector(5000, 0));
      }
    } else {
      _machine.dispatch('idle');
    }
  }

  function _attack() {

  }

  function _setPlayerDirection() {
    if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
      self.direction = (Ctrls.lastKeyPressed('a', 'd')) ? 'left' : 'right';
    }
  }

  function update(dt) {
    _setPlayerDirection();

    if (!Collision.hit('y') && _machine.state !== 'fall') _machine.dispatch('fall');

    _machine.transitions[_machine.state].active();

    Self.update(dt);
  }

  function render(ctx) {
    let currentFrame = Animations.getCurrentFrame();
    ctx.fillStyle = 'green';
    ctx.fillRect(Self.pos.x, Self.pos.y, Self.width, Self.height);
    ctx.drawImage(currentFrame.sprite,
                  currentFrame.data.sX,
                  currentFrame.data.sY,
                  currentFrame.data.sWidth,
                  currentFrame.data.sHeight,
                  Math.round(Self.pos.x - HITBOX.offsetX + currentFrame.data.offsetX),
                  Math.round(Self.pos.y - HITBOX.offsetY + currentFrame.data.offsetY),
                  currentFrame.data.sWidth, currentFrame.data.sHeight);
  }

  function init() {
    Animations.init();
  }

  return {
    update,
    render,
    init
  };
}());

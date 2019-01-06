/* jshint esversion: 6 */
const Player = (function() {
  const self = {
    direction: 'right'
  };

  const DEFAULTS = {
    pos: {x: 350, y: 250},
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
    mass: DEFAULTS.mass,
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
        attack() { this.changeStateTo('attack'); }
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
      _attack();
    } else {
      Animations.play('idle', self.direction);
      _clearPlayerAttackBox();
    }

    if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) _machine.dispatch('run');
    if (Ctrls.isPressed('space')) _machine.dispatch('jump');
  }

  function _run() {
    if (Ctrls.isClicked('leftClick')) {
      Animations.play('attack_run', self.direction);
      _attack();
    } else {
      Animations.play('run', self.direction);
      _clearPlayerAttackBox();
    }

    if (Ctrls.isPressed('space')) _machine.dispatch('jump');

    if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
      if (self.direction === 'left') Self.apply(new Vector(-15000, 0));
      if (self.direction === 'right') Self.apply(new Vector(15000, 0));
    } else {
      if (Self.velocity.x === 0) _machine.dispatch('idle');
    }
  }

  function _jump() {
    if (Ctrls.isClicked('leftClick')) {
      Animations.play('attack_jump', self.direction);
      _attack();
    } else {
      Animations.play('jump', self.direction);
      _clearPlayerAttackBox();
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
      _attack();
    } else {
      Animations.play('fall', self.direction);
      _clearPlayerAttackBox();
    }
    if (!Collision.hit('y')) {
      if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
        if (self.direction === 'left') Self.apply(new Vector(-13000, 0));
        if (self.direction === 'right') Self.apply(new Vector(13000, 0));
      }
    } else {
      _machine.dispatch('idle');
    }
  }

  function _attack() {
    if (self.direction === 'right') {
      Events.emit('PLAYER_ATTACKBOX', {
        x: Self.pos.x + HITBOX.width,
        y: Self.pos.y,
        range: 45,
        cooldown: 30,
        damage: 10
      });
    } else {
      Events.emit('PLAYER_ATTACKBOX', {
        x: Self.pos.x,
        y: Self.pos.y,
        range: -45,
        cooldown: 30,
        damage: 10
      });
    }
  }

  function _clearPlayerAttackBox() {
    Events.emit('PLAYER_ATTACKBOX', {
      x: 0,
      y: 0,
      range: 0,
      cooldown: 0
    });
  }

  function _setPlayerDirection() {
    if (Ctrls.isPressed('a') || Ctrls.isPressed('d')) {
      self.direction = (Ctrls.lastKeyPressed('a', 'd')) ? 'left' : 'right';
    }
  }

  function getPosition() {
    return {
      x: Self.pos.x,
      y: Self.pos.y
    };
  }

  function getVelocity() {
    return {
      x: Self.velocity.x,
      y: Self.velocity.y
    };
  }

  function getDirection() {
    return self.direction;
  }

  function _drawHealth(ctx, health, x, y) {
    ctx.save();
    ctx.fillStyle = "red";
    ctx.font = "10px Arial";
    ctx.fillText(health, x, y);
    ctx.restore();
  }

  function update(dt, ENEMIES) {
    _setPlayerDirection();

    Events.emit('PLAYER_POSITION', Self.pos);
    Events.emit('PLAYER_HITBOX', HITBOX);

    if (!Collision.hit('y') && _machine.state !== 'fall') _machine.dispatch('fall');

    _machine.transitions[_machine.state].active();

    Self.update(dt);
  }

  function render(ctx) {
    let currentFrame = Animations.getCurrentFrame();
    ctx.drawImage(currentFrame.sprite,
                  currentFrame.data.sX,
                  currentFrame.data.sY,
                  currentFrame.data.sWidth,
                  currentFrame.data.sHeight,
                  Math.round(Self.pos.x - HITBOX.offsetX + currentFrame.data.offsetX),
                  Math.round(Self.pos.y - HITBOX.offsetY + currentFrame.data.offsetY),
                  currentFrame.data.sWidth, currentFrame.data.sHeight);

    _drawHealth(ctx, Events.listen('CAMERA_OFFSET_X') + Self.pos.x,
                Math.round(Self.pos.x),
                Math.round(Self.pos.y - 30));

    Tests.drawHitbox(ctx,
                    Math.round(Self.pos.x),
                    Math.round(Self.pos.y),
                    HITBOX.width,
                    HITBOX.height);

    let cur = Events.listen('PLAYER_ATTACKBOX');
    // console.log(cur);

    if (cur) Tests.drawPlayerAttackBox(ctx,
                    Math.round(cur.x),
                    Math.round(cur.y),
                    cur.range, HITBOX.height);

    Tests.drawCollisionPoints(ctx, false, Collision.collisionPoints);
  }

  function init() {
    Animations.init();
  }

  return {
    getPosition,
    getVelocity,
    getDirection,
    update,
    render,
    init
  };
}());

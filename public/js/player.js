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

  const STATS = {
    health: 500
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
      _nullifyPlayerAttack();
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
      _nullifyPlayerAttack();
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
      _nullifyPlayerAttack();
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
      _nullifyPlayerAttack();
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
    let tickcount = Animations.getCurrentTickCount();

    // Link sword hits to the animation by only emitting hits when the sword is visually in front of the player
    if (tickcount > 11 && tickcount < 24) {
      Events.emit('PLAYER_ATTACK', {
        direction: self.direction, range: 70, cooldown: 30, damage: 5, critchance: 50, knockbackForce: 150000
      });
    } else {
      _nullifyPlayerAttack();
    }
  }

  function _nullifyPlayerAttack() {
    Events.emit('PLAYER_ATTACK', {
      direction: self.direction,
      range: 0,
      cooldown: 0,
      damage: 0,
      critchance: 0,
      knockbackForce: 0
    });
  }

  function _checkForIncomingAttacks(x, y) {

    let attacksWithinRange = Events.listen('ATTACKS').filter(cur => {
      let xLeft = cur.x;
      let xRight = cur.x + cur.width;
      let yTop = cur.y;
      let yBottom = cur.y + cur.height;
      console.log((x > xLeft && x < xRight) && (y > yTop && y < yBottom));
      return (x > xLeft && x < xRight) && (y > yTop && y < yBottom);
    });

    // console.log(attacksWithinRange);
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
    ctx.font = "25px Arial";
    ctx.fillText('Player Health: ' + health, x, y);
    ctx.restore();
  }

  function update(dt, ENEMIES) {
    _setPlayerDirection();
    _checkForIncomingAttacks(Self.pos.x, Self.pos.y);

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

    _drawHealth(ctx, STATS.health, 20, 40);

    Tests.drawHitbox(ctx,
                    Math.round(Self.pos.x),
                    Math.round(Self.pos.y),
                    HITBOX.width,
                    HITBOX.height);

    Events.listen('ATTACKS').forEach(cur => {
      Tests.drawHitbox(ctx,
        Math.round(cur.x),
        Math.round(cur.y),
        cur.width,
        cur.height);
    });


    Tests.drawCollisionPoints(ctx, true, Collision.collisionPoints);
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

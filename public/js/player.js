/* jshint esversion: 6 */
const Player = (function({Animations}) {
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
        attack() {}
      },
      'run': {
        active() { _run(); },
        idle() { this.changeStateTo('idle'); },
        jump() { this.changeStateTo('jump'); },
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
      if (self.direction === 'right') self.pos.x += 2;
      if (self.direction === 'left') self.pos.x -= 2;
    } else {
      _machine.dispatch('idle');
    }
  }

  function _jump() {
    if (_isClicked('leftClick')) {
      Animations.play('attack_jump', self.direction);
    } else {
      Animations.play('jump', self.direction);
    }

    self.pos.y -= 2;

    if (!self.jump) {
      self.jump = true;
      self.touchingFloor = false;
      setTimeout(() => {
        self.jump = false;
        _machine.dispatch('fall');
      }, 500);
    }
  }

  function _fall() {
    if (_isClicked('leftClick')) {
      Animations.play('attack_jump', self.direction);
    } else {
      Animations.play('fall', self.direction);
    }

    self.pos.y += 2;

    if (!self.falling) {
      self.falling = true;
      setTimeout(() => {
        self.falling = false;
        self.touchingFloor = true;
      }, 500);
    }

    if (self.touchingFloor) _machine.dispatch('idle');
  }

  function _attack() {

  }

  function init() {
    Animations.init();
  }

  function update() {
    _setPlayerDirection();

    _machine.transitions[_machine.state].active();
  }

  function render(ctx) {
    let currentFrame = Animations.getRenderData();
    ctx.drawImage(currentFrame.sprite,
                  currentFrame.data.sX,
                  currentFrame.data.sY,
                  currentFrame.data.sWidth,
                  currentFrame.data.sHeight,
                  self.pos.x + currentFrame.data.offsetX,
                  self.pos.y + currentFrame.data.offsetY,
                  currentFrame.data.sWidth, currentFrame.data.sHeight);
  }

  return {
    init,
    update,
    render
  };
}({
  Animations: new PlayerAnimations()
}));

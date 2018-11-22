/* jshint esversion: 6 */
const Player = (function() {
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
    console.log('idle ');
    if (Events.listen('ctrls_key_a').active || Events.listen('ctrls_key_d').active) _machine.dispatch('run');
    if (Events.listen('ctrls_key_space').active) _machine.dispatch('jump');
  }

  function _run() {
    console.log('running ' + self.direction);
    if (Events.listen('ctrls_key_space').active) _machine.dispatch('jump');

    if (Events.listen('ctrls_key_a').active || Events.listen('ctrls_key_d').active) {
      if (self.direction === 'right') self.pos.x += 2;
      if (self.direction === 'left') self.pos.x -= 2;
    } else {
      _machine.dispatch('idle');
    }
  }

  function _jump() {
    console.log('jumping');

    self.pos.y -= 1;

    if (!self.jump) {
      self.jump = true;
      self.touchingFloor = false;
      setTimeout(() => {
        self.jump = false;
        _machine.dispatch('fall');
      }, 1000);
    }
  }

  function _fall() {
    console.log('falling ');

    self.pos.y += 1;

    if (!self.falling) {
      self.falling = true;
      setTimeout(() => {
        self.falling = false;
        self.touchingFloor = true;
      }, 1000);
    }

    if (self.touchingFloor) _machine.dispatch('idle');
  }

  function _setPlayerDirection() {
    if (Events.listen('ctrls_key_a').active || Events.listen('ctrls_key_d').active) {
      self.direction = (Events.listen('ctrls_key_a').timestamp.keyDown > Events.listen('ctrls_key_d').timestamp.keyDown) ? 'left' : 'right';
    }
  }

  function update() {
    _setPlayerDirection();

    _machine.transitions[_machine.state].active();
  }

  function render(ctx) {
    let image = Assets.img('player', `animation_attack_${self.direction}`);
    ctx.drawImage(image, 180, 0, 90, 70, self.pos.x, self.pos.y, 90, 70);
  }

  return {
    update,
    render
  };
}());

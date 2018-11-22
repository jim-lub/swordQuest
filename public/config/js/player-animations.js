/* jshint esversion: 6 */

class PlayerAnimations_CONFIG {
  idle() {
    return {
      name: 'idle',
      sprite: {
        left: 'animation_idle_left',
        right: 'animation_idle_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 59,
      ticksPerFrame: 10,
      frames: 7,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [360, 300, 240, 180, 120, 60, 0],
        right: [0, 60, 120, 180, 240, 300, 360]
      },
      sY: [0, 0, 0, 0, 0, 0, 0],
      sWidth: 60,
      sHeight: 70,
      offsetX: {left: -10, right: 0},
      offsetY: {left: 0, right: 0}
    };
  }

  run() {
    return {
      name: 'run',
      sprite: {
        left: 'animation_run_left',
        right: 'animation_run_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 47,
      ticksPerFrame: 6,
      frames: 8,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [420, 360, 300, 240, 180, 120, 60, 0],
        right: [0, 60, 120, 180, 240, 300, 360, 420]
      },
      sY: [0, 0, 0, 0, 0, 0, 0, 0],
      sWidth: 60,
      sHeight: 70,
      offsetX: {left: -12, right: 0},
      offsetY: {left: 0, right: 0}
    };
  }

  jump() {
    return {
      name: 'jump',
      sprite: {
        left: 'animation_jump_left',
        right: 'animation_jump_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 19,
      ticksPerFrame: 10,
      frames: 2,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [60, 0],
        right: [0, 60]
      },
      sY: [0, 0],
      sWidth: 60,
      sHeight: 70,
      offsetX: {left: -13, right: 3},
      offsetY: {left: 1, right: 1}
    };
  }

  fall() {
    return {
      name: 'fall',
      sprite: {
        left: 'animation_fall_left',
        right: 'animation_fall_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 19,
      ticksPerFrame: 10,
      frames: 2,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [60, 0],
        right: [0, 60]
      },
      sY: [0, 0],
      sWidth: 60,
      sHeight: 70,
      offsetX: {left: 2, right: 1},
      offsetY: {left: 2, right: 2}
    };
  }

  slide() {
    return {
      name: 'fall',
      sprite: {
        left: 'animation_slide_left',
        right: 'animation_slide_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 19,
      ticksPerFrame: 10,
      frames: 2,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [60, 0],
        right: [0, 60]
      },
      sY: [0, 0],
      sWidth: 60,
      sHeight: 70,
      offsetX: {left: 0, right: 0},
      offsetY: {left: 5, right: 5}
    };
  }

  attack() {
    return {
      name: 'attack',
      sprite: {
        left: 'animation_attack_left',
        right: 'animation_attack_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 35,
      ticksPerFrame: 4,
      frames: 9,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [720, 630, 540, 450, 360, 270, 180, 90, 0],
        right: [0, 90, 180, 270, 360, 450, 540, 630, 720]
      },
      sY: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      sWidth: 90,
      sHeight: 70,
      offsetX: {left: -35, right: 1},
      offsetY: {left: 0, right: 0}
    };
  }

  attack_run() {
    return {
      name: 'attack_run',
      sprite: {
        left: 'animation_attack_run_left',
        right: 'animation_attack_run_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 35,
      ticksPerFrame: 4,
      frames: 9,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [720, 630, 540, 450, 360, 270, 180, 90, 0],
        right: [0, 90, 180, 270, 360, 450, 540, 630, 720]
      },
      sY: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      sWidth: 90,
      sHeight: 70,
      offsetX: {left: -35, right: 1},
      offsetY: {left: 0, right: 0}
    };
  }

  attack_jump() {
    return {
      name: 'attack_jump',
      sprite: {
        left: 'animation_attack_jump_left',
        right: 'animation_attack_jump_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 31,
      ticksPerFrame: 4,
      frames: 8,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [686, 588, 490, 392, 294, 196, 98, 0],
        right: [0, 98, 196, 294, 392, 490, 588, 686]
      },
      sY: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      sWidth: 98,
      sHeight: 70,
      offsetX: {left: -40, right: -2},
      offsetY: {left: 1, right: 1}
    };
  }

  default() {
    return {
      name: '',
      sprite: {
        left: '_left',
        right: '_right'
      },
      direction: ['left', 'right'],
      ticksPerSequence: 0,
      ticksPerFrame: 0,
      frames: 0,
      overrideTicksPerFram: false,
      // customTicksPerFrame: [['frameStart', 'frameEnd'], ['frameStart', 'frameEnd']],
      sX: {
        left: [0],
        right: [0]
      },
      sY: [0],
      sWidth: 0,
      sHeight: 70,
      offsetX: {left: 0, right: 0},
      offsetY: {left: 0, right: 0}
    };
  }
}

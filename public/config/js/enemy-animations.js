/* jshint esversion: 6 */

class EnemyAnimations_CONFIG {
  idle() {
    return {
      name: 'idle',
      sprite: {
        left: 'animation_idle_left',
        right: 'animation_idle_right'
      },
      direction: ['left'],
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

}

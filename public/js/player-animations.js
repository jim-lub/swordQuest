/* jshint esversion: 6 */

class PlayerAnimations {
  constructor() {
    this.currentSprite = null;
    this.currentData = null;
    this.currentIndex = null;
    this.tickCount = 0;
    this.queue = [];
    this.sequences = {};
    this.animations = {};
    this.sprites = null;

    this.cfg = new PlayerAnimations_CONFIG();
  }

  init(sprites) {
    this.sprites = sprites;

    this.buildSequence('idle', 'left');
    this.buildSequence('idle', 'right');

    this.buildSequence('run', 'left');
    this.buildSequence('run', 'right');

    this.buildSequence('jump', 'left');
    this.buildSequence('jump', 'right');

    this.buildSequence('fall', 'left');
    this.buildSequence('fall', 'right');

    this.buildSequence('slide', 'left');
    this.buildSequence('slide', 'right');

    this.buildSequence('attack', 'left');
    this.buildSequence('attack', 'right');

    this.buildSequence('attack_run', 'left');
    this.buildSequence('attack_run', 'right');

    this.buildSequence('attack_jump', 'left');
    this.buildSequence('attack_jump', 'right');
  }

  buildSequence(action, direction) {
    const CFG = this.cfg[action]();
    let sequence = [];

    for (let i = 0; i < CFG.frames; i++) {
      let start, end, total;

      if (CFG.overrideTicksPerFrame) {
        start = customTicksPerFrame[i][0];
        end = start = customTicksPerFrame[i][1];
      } else {
        start = i * CFG.ticksPerFrame;
        end = ((i + 1) * CFG.ticksPerFrame) - 1;
      }

      sequence.push({
        name: CFG.sprite[direction],
        index: i,
        frames: CFG.frames,
        sprite: Assets.img('player', CFG.sprite[direction]),
        ticksPerSequence: CFG.ticksPerSequence,
        sX: CFG.sX[direction][i],
        sY: CFG.sY[i],
        sWidth: CFG.sWidth,
        sHeight: CFG.sHeight,
        offsetX: CFG.offsetX[direction],
        offsetY: CFG.offsetY[direction],
        start: start,
        end: end
      });

      this.sequences[`${CFG.sprite[direction]}`] = sequence;
    }
  }

  play(action, direction) {
    this.tickCount++;

    let sequence = this.sequences[`animation_${action}_${direction}`];

    sequence.forEach(frame => {
      // if (this.currentIndex != frame.index) console.log(this.currentIndex);
      if (this.tickCount >= frame.start && this.tickCount <= frame.end && this.currentIndex != frame.index) {
        this.currentSprite = frame.sprite;
        this.currentData = {
          sX: frame.sX,
          sY: frame.sY,
          sWidth: frame.sWidth,
          sHeight: frame.sHeight,
          offsetX: frame.offsetX,
          offsetY: frame.offsetY
        };
        this.currentIndex = frame.index;
      }

      if (this.tickCount > frame.ticksPerSequence) {
        this.tickCount = 0;
        this.currentIndex = null;
      }
    });
  }

  getRenderData() {
    return {
      sprite: this.currentSprite,
      data: this.currentData
    };
  }

}

/* jshint esversion: 6 */
const Animations = (function() {

  const savedAnimationSequences = {
    hero: {},
    hellishsmith: {},
    swordknight: {}
  };

  function _loadJSON(file) {
    return new Promise((resolve, reject) => {
      $.getJSON(`config/json/animations/${file}`, (result) => { resolve(result); });
    });
  }

  function _buildSequence(data, type, action, dir) {
    const CFG = data;
    let sequence = [];

    for (let i = 0; i < CFG.frames; i++) {
      let start, end, total;

      start = i * CFG.ticksPerFrame;
      end = ((i + 1) * CFG.ticksPerFrame) - 1;

      sequence.push({
        name: CFG.sprite[dir],
        index: i,
        frames: CFG.frames,
        sprite: Assets.img(type, CFG.sprite[dir]),
        ticksPerSequence: CFG.ticksPerSequence,
        sX: CFG.sX[dir][i],
        sY: CFG.sY[i],
        sWidth: CFG.sWidth,
        sHeight: CFG.sHeight,
        offsetX: CFG.offsetX[dir],
        offsetY: CFG.offsetY[dir],
        start: start,
        end: end
      });
    }

    return sequence;
  }

  function _build(type) {
    return new Promise((resolve, reject) => {
      _loadJSON(`${type}.json`).then(data => {
        let entries = Object.entries(data[type].actions);

        entries.forEach(cur => {
          cur[1].direction.forEach(dir => {
            savedAnimationSequences[type][`animation_${cur[0]}_${dir}`] = _buildSequence(cur[1], type, cur[0], dir);
          });
        });
        resolve();
      })
      .catch(e => reject(e));
    });
  }

  function init() {
    return new Promise((resolve, reject) => {
      let objects = [_build('hero'), _build('hellishsmith'), _build('swordknight')];

      Promise.all(objects)
      .then(() => resolve())
      .catch(e => reject(e));
    });
  }

  function assign(type) {
    let state = {
      currentSprite: null,
      currentData: null,
      currentIndex: null,
      tickCount: 0,
      type: type
    };
    return Object.assign(state, ...[play(state)]);
  }

  const play = (state) => ({
    play: (action, dir) => {
      state.tickCount++;
      let sequence = savedAnimationSequences[state.type][`animation_${action}_${dir}`];

      sequence.forEach(frame => {
        if (state.tickCount >= frame.start &&
            state.tickCount <= frame.end &&
            state.currentIndex != frame.index) {

              state.currentSprite = frame.sprite;
              state.currentData = {
                sX: frame.sX,
                sY: frame.sY,
                sWidth: frame.sWidth,
                sHeight: frame.sHeight,
                offsetX: frame.offsetX,
                offsetY: frame.offsetY
              };
              state.currentIndex = frame.index;
        }

        if (state.tickCount > frame.ticksPerSequence) {
          state.tickCount = 0;
          state.currentIndex = null;
        }
      });
    }
  });

  return {
    init,
    assign
  };
}());

/* jshint esversion: 6 */
const Fx = (function() {

  let savedFxSequences = {

  };

  let state = {
    tickCount: 0,
    currentSprite: null,
    currentData: {},
    currentIndex: 0
  };

  // const backgroundLayer = [];
  // const foregroundLayer = [];
  //
  // function add(event, data) {
  //   events[eventID] = data;
  // }
  //
  // function listen(eventID) {
  //   if (!events[eventID]) {
  //     return null;
  //   } else {
  //     return events[eventID];
  //   }
  // }

  function play(fx) {
    state.tickCount++;

    let sequence = savedFxSequences[fx];

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

  function init() {
    return new Promise((resolve, reject) => {
      let objects = [_build('fx')];

      Promise.all(objects)
      .then(() => {console.log(savedFxSequences); resolve(); })
      .catch(e => reject(e));
    });
  }

  function _build(type) {
    return new Promise((resolve, reject) => {
      _loadJSON(`${type}.json`).then(data => {
        let entries = Object.entries(data[type].types);

        entries.forEach(cur => {
          savedFxSequences[cur[0]] = _buildSequence(cur[1]);
        });
        resolve();
      })
      .catch(e => reject(e));
    });
  }

  function _loadJSON(file) {
    return new Promise((resolve, reject) => {
      $.getJSON(`config/json/fx/${file}`, (result) => { resolve(result); });
    });
  }

  function _buildSequence(data) {
    const CFG = data;
    let sequence = [];

    for (let i = 0; i < CFG.frames; i++) {
      let start, end, total;

      start = i * CFG.ticksPerFrame;
      end = ((i + 1) * CFG.ticksPerFrame) - 1;

      sequence.push({
        name: CFG.sprite,
        index: i,
        frames: CFG.frames,
        sprite: Assets.img('fx', CFG.sprite),
        ticksPerSequence: CFG.ticksPerSequence,
        ticksPerFrame: CFG.ticksPerFrame,
        sX: CFG.sX[i],
        sY: CFG.sY[i],
        sWidth: CFG.sWidth,
        sHeight: CFG.sHeight,
        offsetX: CFG.offsetX,
        offsetY: CFG.offsetY,
        start: start,
        end: end
      });
    }

    return sequence;
  }

  return {
    init,
    play,
    savedFxSequences,
    state
  };
}());

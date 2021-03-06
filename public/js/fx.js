/* jshint esversion: 6 */
const Fx = (function() {

  /********************************************************************************
  * @Update -
  * @ update
  * @
  ********************************************************************************/
  function update() {
    _filter();

    DevTools.Abstractor.emit({
      name: 'activeFx',
      text: 'Fx.Queue length: ',
      data: Queue.length
    });

    _loop();
  }

  /********************************************************************************
  * @Render -
  * @ render / _draw
  * @
  ********************************************************************************/
  function render(ctx) {
    Queue.forEach(state => {
      _draw(ctx, state);
    });
  }

  function _draw(ctx, state) {
    let data = state.currentData;

    let x = (!state.followCharacter) ? Camera.convertXCoord(state.position.x) : Camera.convertXCoord(Characters2.publishCharacterPosition(state.parentid).x);
    let y = (!state.followCharacter) ? state.position.y : Characters2.publishCharacterPosition(state.parentid).y;

    ctx.drawImage(state.currentSprite,
                    data.sX,
                    data.sY,
                    data.sWidth,
                    data.sHeight,
                    x + state.offset.x - (data.sWidth / 2),
                    y + state.offset.y - (data.sHeight / 2),
                    data.sWidth, data.sHeight);
  }

  /********************************************************************************
  * @Queue - Manage the queue; adding, removing and playing FX
  * @ create / remove
  * @ _newFx
  * @ _filter / _loop
  ********************************************************************************/
  const Queue = [];

  function create({type, position, offsetX, offsetY, id, parentid, limit, startOnTickCount, loop, followCharacter}) {
    let state = {
        type: type,
        position: new Vector(position.x, position.y),
        offset: {
          x: offsetX || 0,
          y: offsetY || 0
        },
        id: id,
        parentid: parentid,
        limit: limit + startOnTickCount || 500,
        loop: loop || false,
        startOnTickCount: startOnTickCount || 0,
        followCharacter: followCharacter || false
    };

    if (_isUnique(state.id, state.type)) {
      let newFx = Object.assign(state, ...[_newFx(state)]);

      Queue.push(newFx);
    }
  }

  const _newFx = (state) => ({
    tickCount: state.startOnTickCount,
    ticksPerSequence: _getTicksPerSequence(state),
    currentData: {},
    currentIndex: 0,
    currentSprite: _getCurrentSprite(state)
  });


  function _isUnique(id, type) {
    let count = Queue.filter(cur => {
      return cur.id === id && cur.type === type;
    }).length;

    return (count === 0);
  }

  function _filter() {
    Queue.forEach((state, index) => {
      if (!state.loop && state.tickCount >= state.ticksPerSequence || state.tickCount > state.limit) Queue.splice(index, 1);
    });
  }

  function _loop() {
    Queue.forEach(cur => {
      _play(cur);
    });
  }

  /********************************************************************************
  * @Play the sequence
  * @ _play
  * @
  ********************************************************************************/
  function _play(state) {
    state.tickCount++;

    let sequence = savedSequences[state.type];

    sequence.forEach(frame => {
      if (state.tickCount >= frame.start &&
          state.tickCount <= frame.end &&
          state.currentIndex != frame.index) {

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

  function _getTicksPerSequence(state) {
    let sequence = savedSequences[state.type];

    return sequence[0].ticksPerSequence;
  }

  function _getCurrentSprite(state) {
    let sequence = savedSequences[state.type];

    return sequence[0].sprite;
  }

  /********************************************************************************
  * @Initialize all fx sequences and save them in 'savedSequences'
  * @ _build / _buildSequence / _loadJSON
  * @
  ********************************************************************************/
  const savedSequences = {};

  function init() {
    return new Promise((resolve, reject) => {
      let objects = [_build('fx')];

      Promise.all(objects)
      .then(() => resolve())
      .catch(e => reject(e));
    });
  }

  function _build(type) {
    return new Promise((resolve, reject) => {
      _loadJSON(`${type}.json`).then(data => {
        let entries = Object.entries(data[type].types);

        entries.forEach(cur => {
          savedSequences[cur[0]] = _buildSequence(cur[1]);
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
        sX: CFG.sWidth * (i + 1),
        sY: 0,
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
    update,
    create,
    render,
    Queue
  };
}());

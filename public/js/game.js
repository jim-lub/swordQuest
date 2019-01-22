/* jshint esversion: 6 */
const Game = (function() {
  const ctx = document.getElementById('canvas').getContext('2d');

  const Lvl = new Level();
  const LEVEL = [];

  const animationFrameData = {
    frameID: null,
    running: true,
    started: true,
    dt: 0,
    lastFrameTimeMs: 0,
    timestep: 1000 / 60,
    fps: 60,
    framesThisSecond: 0,
    lastFpsUpdate: 0
  };

  function init() {
    let spacingX = -300;

    for (let i = 0; i < 10; i++) {
      LEVEL.push(new Tile({x: -300, y: 152 + (i * 32), width: 32, height: 32}));
    }
    for (let i = 0; i < 150; i++) {
      LEVEL.push(new Tile({x: spacingX, y: 480, width: 32, height: 32}));
      spacingX += 32;
    }
    Events.emit('tiles', LEVEL);

    Entities.init([
      {type: 'hellishsmith', spawnPosition: {x: 150, y: 50}},
      {type: 'swordknight', spawnPosition: {x: 550, y: 150}},
      {type: 'hero', isPlayerControlled: true, spawnPosition: {x: 350, y: 150}}
    ]);

    animationFrameData.frameID = requestAnimationFrame(loop);
  }

  function loop() {

    if (_timestamp() > animationFrameData.lastFpsUpdate + 1000) {
      animationFrameData.fps = 0.25 * animationFrameData.framesThisSecond + (1 - 0.25) * animationFrameData.fps;

      animationFrameData.lastFpsUpdate = _timestamp();
      animationFrameData.framesThisSecond = 0;
    }
    animationFrameData.framesThisSecond++;

    animationFrameData.dt += _timestamp() - animationFrameData.lastFrameTimeMs;
    animationFrameData.lastFrameTimeMs = _timestamp();

    let numUpdateSteps = 0;
    while (animationFrameData.dt >= animationFrameData.timestep) {
      _update(animationFrameData.timestep);
      animationFrameData.dt -= animationFrameData.timestep;

      if (++numUpdateSteps >= 240) {
        _panic();
        break;
      }
    }

    _render();

    animationFrameData.frameID = requestAnimationFrame(loop);
  }

  function _panic() {
    animationFrameData.dt = 0;
  }

  function start() {
    if (!animationFrameData.started) {
      animationFrameData.started = true;

      animationFrameData.frameID = requestAnimationFrame(function(timestamp) {
        _render(1);
        animationFrameData.running = true;

        animationFrameData.lastFrameTimeMs = _timestamp();
        animationFrameData.lastFpsUpdate = _timestamp();

        animationFrameData.framesThisSecond = 0;

        animationFrameData.frameID = requestAnimationFrame(loop);
      });
    }

  }

  function stop() {
    animationFrameData.running = false;
    animationFrameData.started = false;

    cancelAnimationFrame(animationFrameData.frameID);
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  function _update(dt) {
    DevTools.Components.listener();
    Lvl.update();

    Entities.update(dt);
    Fx.update();
    Camera.update();

    Events.emit('tiles', LEVEL);

    DevTools.Abstractor.emit({
      name: 'FPS',
      text: 'FPS: ',
      data: Math.round(animationFrameData.fps)
    });
  }
  function _render() {
    ctx.clearRect(0, 0, 1280, 640);

    Lvl.render(ctx);
    Entities.render(ctx);
    Fx.render(ctx);

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.2;
    LEVEL.forEach(cur => {
      ctx.fillRect(cur.x + -Events.listen('CAMERA_OFFSET_X'), cur.y, cur.width, cur.height);
    });
    ctx.globalAlpha = 1;
  }

  return { init, start, stop };
}());

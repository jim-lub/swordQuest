/* jshint esversion: 6 */
const Game = (function() {
  const Lvl = new Level();

  const LEVEL = [];
  const ctx = document.getElementById('canvas').getContext('2d');

  const _loop = {
    now: null,
    dt: 0,
    last: null,
    step: 1/60,
    loop() {
      this.now = _timestamp();
      this.dt = this.dt + Math.min(1, (this.now - this.last) / 1000);

      while (this.dt > this.step) {
        this.dt = this.dt - this.step;
        _update(this.step);
      }

      _render(this.dt);

      this.last = this.now;
      window.requestAnimationFrame(this.loop.bind(this));
    }
  };

  function _update(dt) {
    DevTools.Components.listener();
    Lvl.update();

    Entities.update(dt);
    Fx.update();
    Camera.update();

    Events.emit('tiles', LEVEL);
  }

  function _render(dt) {
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

    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}());

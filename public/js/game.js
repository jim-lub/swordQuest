/* jshint esversion: 6 */
const Game = (function() {
  const Cam = new Camera();
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
    Tests.eventHandlers();
    Lvl.update();

    Characters.update(dt);
    Cam.update();

    Events.emit('tiles', LEVEL);
  }

  function _render(dt) {
    ctx.clearRect(0, 0, 1280, 640);

    Lvl.render(ctx);
    Characters.render(ctx);

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.2;
    LEVEL.forEach(cur => {
      ctx.fillRect(cur.x - Events.listen('CAMERA_OFFSET_X'), cur.y, cur.width, cur.height);
    });
    ctx.globalAlpha = 1;
  }

  function init() {
    let spacingX = -300;

    for (let i = 0; i < 10; i++) {
      LEVEL.push(new Tile({x: -300, y: 152 + (i * 32), width: 32, height: 32}));
    }
    for (let i = 0; i < 80; i++) {
      LEVEL.push(new Tile({x: spacingX, y: 480, width: 32, height: 32}));
      spacingX += 32;
    }
    Events.emit('tiles', LEVEL);

    Characters.init({
      player: [
        {type: 'hero', width: 20, height: 35, health: 100, x: 400, y: 300, mass: 100}
      ],
      npcs: [
        {type: 'hellishsmith', width: 40, height: 75, health: 150, x: 100, y: 200, mass: 600},
        {type: 'swordknight', width: 40, height: 65, health: 250, x: 300, y: 200, mass: 700},
        {type: 'hellishsmith', width: 40, height: 75, health: 50, x: 500, y: 200, mass: 600}
      ]
    });

    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}());

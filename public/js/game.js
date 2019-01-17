/* jshint esversion: 6 */
const Game = (function() {
  const Lvl = new Level();

  const LEVEL = [];
  const ctx = document.getElementById('canvas').getContext('2d');

  const _loop = {
    now: null,
    dt: 0,
    last: null,
    step: 1000/60,
    loop() {
      this.timestamp = _timestamp();
      this.dt += this.timestamp - this.last;
      this.last = this.timestamp;

      while (this.dt >= this.step) {
        _update(this.step);
        this.dt -= this.step;
      }

      _render(this.dt);
      window.requestAnimationFrame(this.loop.bind(this));
    }
  };

  function _update(dt) {
    DevTools.Components.listener();
    Lvl.update();

    Characters.update(dt);
    Fx.update();
    Camera.update();

    Events.emit('tiles', LEVEL);
  }

  function _render(dt) {
    ctx.clearRect(0, 0, 1280, 640);

    Lvl.render(ctx);
    Characters.render(ctx);
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

    Characters.init({
      player: [
        {type: 'hero', width: 20, height: 35, health: 1000, x: 400, y: 300, mass: 20}
      ],
      npcs: [
        {type: 'hellishsmith', width: 40, height: 75, health: 2500, x: 100, y: 200, attackRadius: 100, mass: 6},
        {type: 'swordknight', width: 40, height: 65, health: 1500, x: 300, y: 200, attackRadius: 80, mass: 7},
        {type: 'hellishsmith', width: 40, height: 75, health: 2500, x: 500, y: 200, mass: 6}
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

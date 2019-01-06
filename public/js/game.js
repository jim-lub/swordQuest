/* jshint esversion: 6 */
const Game = (function() {
  const Cam = new Camera();
  const Lvl = new Level();

  const LEVEL = [];
  const ENEMIES = [];
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
    Lvl.update();
    Events.emit('ENEMIES', ENEMIES);
    Player.update(dt, ENEMIES);

    ENEMIES.filter(cur => {
      return cur.health > 0;
    });

    ENEMIES.forEach((cur, index) => {
      if (cur.health <= 0) ENEMIES.splice(index, 1);
      cur.update(dt);
    });

    Cam.update(Player.getPosition(), Player.getVelocity(), Player.getDirection());
    Events.emit('tiles', LEVEL);
  }

  function _render(dt) {
    ctx.clearRect(0, 0, 1280, 640);

    Lvl.render(ctx);

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0;
    LEVEL.forEach(cur => {
      ctx.fillRect(cur.x, cur.y, cur.width, cur.height);
    });
    ctx.globalAlpha = 1;
    ENEMIES.forEach((cur, index) => {
      cur.render(ctx);
    });
    Player.render(ctx);
  }

  function init() {
    let spacingX = 0;
    for (let i = 0; i < 80; i++) {
      LEVEL.push(new Tile({x: spacingX, y: 480, width: 32, height: 32}));
      spacingX += 32;
    }
    Events.emit('tiles', LEVEL);
    Player.init();

    ENEMIES.push(Enemy.build({id: 1, x: 50, y: 100, height: 75, width: 50, mass: 400, fov: 30, radius: 90, type: 'hellishsmith'}));
    ENEMIES.push(Enemy.build({id: 2, x: 450, y: 100, height: 65, width: 40, mass: 400, fov: 300, radius: 100, type: 'swordknight'}));
    ENEMIES.push(Enemy.build({id: 3, x: 700, y: 100, height: 65, width: 40, mass: 400, fov: 300, radius: 100, type: 'swordknight'}));
    ENEMIES.push(Enemy.build({id: 4, x: 800, y: 100, height: 75, width: 50, mass: 400, fov: 300, radius: 90, type: 'hellishsmith'}));

    ENEMIES.forEach((cur, index) => {
      console.log(cur);
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

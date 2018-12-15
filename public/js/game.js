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
    Player.update(dt);

    ENEMIES.forEach((cur, index) => {
      if (index === 0) cur.animations.play('idle', 'right');
      if (index === 1) cur.animations.play('run', 'right');
      if (index === 2) cur.animations.play('attack', 'left');
      if (index === 3) cur.animations.play('attack', 'left');
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
      if (index === 1) cur.apply(new Vector(5000, 0));
      cur.render(ctx);
    });
    Player.render(ctx);
  }

  function init() {
    console.log(Assets.images);
    let spacingX = 0;
    for (let i = 0; i < 80; i++) {
      LEVEL.push(new Tile({x: spacingX, y: 480, width: 32, height: 32}));
      spacingX += 32;
    }
    Events.emit('tiles', LEVEL);
    Player.init();

    ENEMIES.push(Enemy.build({x: 50, y: 100, height: 120, width: 170, mass: 400, type: 'hellishsmith'}));
    ENEMIES.push(Enemy.build({x: 400, y: 100, height: 143, width: 196, mass: 400, type: 'swordknight'}));
    ENEMIES.push(Enemy.build({x: 400, y: 100, height: 143, width: 196, mass: 400, type: 'swordknight'}));
    ENEMIES.push(Enemy.build({x: 800, y: 100, height: 120, width: 170, mass: 400, type: 'hellishsmith'}));

    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}());

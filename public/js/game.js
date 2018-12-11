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
      cur.animations.play('run', 'right');
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
    ENEMIES.forEach(cur => {
      cur.apply(new Vector(5000, 0));
      cur.render(ctx);
    });
    Player.render(ctx);
  }

  function init() {
    let spacingX = 0;
    for (let i = 0; i < 30; i++) {
      LEVEL.push(new Tile({x: spacingX, y: 480, width: 32, height: 32}));
      spacingX += 32;
    }
    Events.emit('tiles', LEVEL);
    Player.init();

    let tempoffsetx = 0;
    for (let i = 0; i < 10; i++) {
      ENEMIES.push(Enemy.init({x: 5 + tempoffsetx, y: 100, height: 60, width: 70, mass: 200}));
      tempoffsetx += 25;
    }

    ENEMIES.forEach(cur => {
      cur.animations.init();
    });

    console.log(ENEMIES[0], ENEMIES[1]);

    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}());

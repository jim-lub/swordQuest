/* jshint esversion: 6 */
const Game = (function({Ctrls, World, Engine}) {
  const LEVEL = [];

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
    Player.update(dt);
    Events.emit('tiles', LEVEL);
  }

  function _render(dt) {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0, 0, 1280, 640);

    ctx.fillStyle = 'grey';
    LEVEL.forEach(cur => {
      ctx.fillRect(cur.x, cur.y, cur.width, cur.height);
    });

    Player.render(ctx);
  }

  function init() {
    LEVEL.push(new Tile({x: 150, y: 468, width: 32, height: 32}));
    LEVEL.push(new Tile({x: 182, y: 436, width: 32, height: 32}));
    let spacingX = 0;
    for (let i = 0; i < 20; i++) {
      LEVEL.push(new Tile({x: spacingX, y: 500, width: 32, height: 32}));
      spacingX += 32;
    }
    Events.emit('tiles', LEVEL);
    Player.init();
    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}({
  Ctrls: new Controls()
}));

/* jshint esversion: 6 */
const Game = (function({Ctrls, World}) {

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

  function _update(step) {
    Ctrls.emit();

    Player.update();
  }

  function _render(dt) {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0, 0, 1280, 640);

    World.renderBackground(ctx);
    World.render('block_01', 4, ctx, 0, 0);
    World.render('block_01', 5, ctx, 0, 0);
    World.render('block_02', 4, ctx, 640, 0);
    World.render('block_02', 5, ctx, 640, 0);

    Player.render(ctx);
  }

  function init() {
    Player.init();
    World.init();
    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}({
  Ctrls: new Controls(),
  World: new Level(),
}));

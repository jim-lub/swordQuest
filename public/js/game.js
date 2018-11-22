/* jshint esversion: 6 */
const Game = (function({Events}) {

  const _timestamp = function() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  };

  const _loop = {
    now: null,
    dt: 0,
    last: _timestamp(),
    step: 1/60,
    _loop() {
      this.now = _timestamp();
      this.dt = this.dt + Math.min(1, (this.now - this.last) / 1000);

      while (this.dt > this.step) {
        this.dt = this.dt - this.step;
        _update(this.step);
      }

      _render(this.dt);

      this.last = this.now;
      window.requestAnimationFrame(this._loop.bind(this));
    }
  };

  const _update = function(step) {
  };

  const _render = function(dt) {
    const ctx = document.getElementById('canvas').getContext('2d');

    ctx.clearRect(0, 0, 1280, 640);
    ctx.fillText(dt, 10, 10);
    ctx.fillRect(50, 50, 50, 50);
  };

  const init = function() {
    window.requestAnimationFrame(_loop._loop.bind(_loop));
  };

  return {
    init
  };
})({Events});

Game.init();

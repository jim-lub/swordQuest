/* jshint esversion: 6 */
const Game = (function({Events, Ctrls}) {
  const pos = {x: 50, y: 50};

  const _loop = {
    now: null,
    dt: 0,
    last: _timestamp(),
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
  }

  function _render(dt) {
    const ctx = document.getElementById('canvas').getContext('2d');
    let image = Assets.img('player', 'animation_attack_left');
    ctx.clearRect(0, 0, 1280, 640);
    ctx.drawImage(image, 180, 0, 90, 70, 150, 150, 90, 70);
    ctx.fillRect(50, 50, 50, 50);
  }

  function init() {

    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}({
  Events,
  Ctrls: new Controls()
}));

$(document).ready(function(){

  Load.images()
  .then(() => {
    Game.init();
  })
  .catch(e => console.log(e));

});

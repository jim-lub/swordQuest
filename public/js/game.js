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
    Tests.eventHandlers();
    Lvl.update();
    Events.emit('ENEMIES', ENEMIES);
    Player.update(dt, ENEMIES);
    Entity.update(dt);

    ENEMIES.filter(cur => {
      return cur.health > 0;
    });

    ENEMIES.forEach((cur, index) => {
      if (cur.health <= 0) ENEMIES.splice(index, 1);
      cur.update(dt);
    });

    // console.log(Events.listen('ATTACKS'));

    Cam.update(Player.getPosition(), Player.getVelocity(), Player.getDirection());
    Events.emit('ATTACKS', []);
    Events.emit('tiles', LEVEL);
  }

  function _render(dt) {
    ctx.clearRect(0, 0, 1280, 640);

    Lvl.render(ctx);
    Entity.render(ctx);

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.2;
    LEVEL.forEach(cur => {
      ctx.fillRect(cur.x - Events.listen('CAMERA_OFFSET_X'), cur.y, cur.width, cur.height);
    });
    ctx.globalAlpha = 1;
    ENEMIES.forEach((cur, index) => {
      cur.render(ctx);
    });
    Player.render(ctx);
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
    Events.emit('ATTACKS', []);
    Player.init();

    Entity.init({
      player: [
        {type: 'hero', width: 32, height: 35, health: 100, x: 400, y: 300}
      ],
      npcs: [
        {type: 'hellishsmith', width: 40, height: 75, health: 150, x: 100, y: 200, mass: 600},
        {type: 'swordknight', width: 40, height: 65, health: 250, x: 300, y: 200, mass: 700},
        {type: 'hellishsmith', width: 40, height: 75, health: 50, x: 500, y: 200, mass: 600}
      ]
    });

    // ENEMIES.push(Enemy.build({id: 1, x: 50, y: 100, height: 75, width: 40, mass: 400, fov: 220, radius: 90, type: 'hellishsmith'}));
    // // ENEMIES.push(Enemy.build({id: 2, x: 450, y: 100, height: 75, width: 40, mass: 400, fov: 220, radius: 100, type: 'hellishsmith'}));
    // // ENEMIES.push(Enemy.build({id: 3, x: 500, y: 100, height: 65, width: 40, mass: 400, fov: 220, radius: 100, type: 'swordknight'}));
    // // ENEMIES.push(Enemy.build({id: 4, x: 600, y: 100, height: 75, width: 40, mass: 400, fov: 220, radius: 100, type: 'hellishsmith'}));
    // ENEMIES.push(Enemy.build({id: 5, x: 700, y: 100, height: 65, width: 40, mass: 400, fov: 220, radius: 100, type: 'swordknight'}));
    // ENEMIES.push(Enemy.build({id: 6, x: 800, y: 100, height: 75, width: 40, mass: 400, fov: 220, radius: 90, type: 'hellishsmith'}));

    window.requestAnimationFrame(_loop.loop.bind(_loop));
  }

  function _timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  return {
    init
  };
}());

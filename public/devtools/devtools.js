/* jshint esversion: 6 */
const DevTools = (function() {

  /********************************************************************************
  * @Components ?
  * @ toggle / listener
  ********************************************************************************/
  const Components = (function() {

    function toggle(type, name) {
      let isChecked = (Controller.isEnabled(type, name)) ? 'checked' : '';

      let html = `<div class="devtools-toggle-container-label"><input type="checkbox" id="${type}-${name}" ${isChecked}/><label for="${type}-${name}"></label></div>
                  <div class="devtools-toggle-container-name">${name}</div>`;

      $(`#toggle-${type}-${name}`).html(html);
    }

    function listener() {
      $('input:checkbox').change(function(){
        if ($(this).is(':checked')) Controller.enable(this.id.split("-")[0], this.id.split("-")[1]);
        else                        Controller.disable(this.id.split("-")[0], this.id.split("-")[1]);
      });
    }

    return { toggle, listener };
  }());


  /********************************************************************************
  * @Controller ?
  * @ enable / disable
  ********************************************************************************/
  const Controller = (function() {
    const toolsEnabled = {
      visualizer: {
        characterHitbox: false,
        characterCollisionPoints: false,
        characterFieldOfView: false,
        characterAttackRadius: false,
        characterAttackPoints: false,
        characterHealPoints: false
      },

      abstractor: {

      }
    };

    function enable(type, name) { toolsEnabled[type][name] = true; }

    function disable(type, name) { toolsEnabled[type][name] = false; }

    function isEnabled(type, name) { return toolsEnabled[type][name]; }

    return { enable, disable, isEnabled };
  }());


  /********************************************************************************
  * @Visualizer ?
  * @ Functions to display visual helpers on the canvas
  ********************************************************************************/
  const Visualizer = (function() {
    function start(name, ctx, data) {
      const transitions = {
        'characterHitbox': (ctx, data) => characterHitbox(ctx, data),
        'characterCollisionPoints': (ctx, data) => characterCollisionPoints(ctx, data),
        'characterFieldOfView': (ctx, data) => characterFieldOfView(ctx, data),
        'characterAttackRadius': (ctx, data) => characterAttackRadius(ctx, data),
        'characterAttackPoints': (ctx, data) => characterAttackPoints(ctx, data),
        'characterHealPoints': (ctx, data) => characterHealPoints(ctx, data)
      };

      const transition = transitions[name];

      if (transition) transitions[name](ctx, data);
    }

    function characterHitbox(ctx, {x, y, width, height}) {
      if (!Controller.isEnabled('visualizer', 'characterHitbox')) return;

      ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "green";

        ctx.fillRect(x, y, width, height);
      ctx.restore();
    }

    function characterCollisionPoints(ctx, {offsetX, collisionPoints}) {
      if (!Controller.isEnabled('visualizer', 'characterCollisionPoints')) return;

      ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "orange";

        collisionPoints.forEach(point => {
          ctx.fillRect(Math.round(point.x + offsetX - 1.5), Math.round(point.y - 3), 3, 3);
        });
      ctx.restore();
    }

    function characterFieldOfView(ctx, {x, y, width, height, fov}) {
      if (!Controller.isEnabled('visualizer', 'characterFieldOfView')) return;

      ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "yellow";

        ctx.beginPath();
        ctx.arc(x + (width / 2), y + height, fov, Math.PI, 0, false);
        ctx.closePath();

        ctx.fill();
      ctx.restore();
    }

    function characterAttackRadius(ctx, {x, y, width, height, attackRadius}) {
      if (!Controller.isEnabled('visualizer', 'characterAttackRadius')) return;

      ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "red";

        ctx.beginPath();
        ctx.arc(x + (width / 2), y + height, attackRadius, Math.PI, 0, false);
        ctx.closePath();

        ctx.fill();
      ctx.restore();
    }

    function characterAttackPoints(ctx, {offsetX, attackPoints}) {
      if (!Controller.isEnabled('visualizer', 'characterAttackPoints')) return;

      ctx.save();
        ctx.fillStyle = "purple";

        attackPoints.forEach(point => {
          ctx.fillRect(Math.round(point.position.x + offsetX - 2), Math.round(point.position.y - 2), 4, 4);
        });
      ctx.restore();
    }

    function characterHealPoints(ctx, {offsetX, healPoints}) {
      if (!Controller.isEnabled('visualizer', 'characterHealPoints')) return;

      ctx.save();
        ctx.fillStyle = "lime";

        healPoints.forEach(point => {
          ctx.fillRect(Math.round(point.position.x + offsetX - 2), Math.round(point.position.y - 2), 4, 4);
        });
      ctx.restore();
    }

    return { start };
  }());


  /********************************************************************************
  * @Abstractor ?
  * @ Crunch some data.. and maybe display it.
  ********************************************************************************/
  const Abstractor = (function() {
    function emit({name, text, data}) {
      let html = `<div class="devtools-abstractor-container-name">${text}</div>
                  <div class="devtools-abstractor-container-data">${data}</div>`;

      $(`#devtools-abstractor-${name}`).html(html);
    }

    return { emit };
  }());


  /********************************************************************************
  * @Disabler ?
  * @ Disable data / actions / visuals / .. everything!
  ********************************************************************************/
  const Disabler = (function() {

  }());

  /********************************************************************************
  * @Input ?
  * @ Visualize keyPresses and mouseClicks
  ********************************************************************************/
  const Input = (function(Ctrls) {

    function emit({a, d, space, shift}) {

      if (a) $(`#devtools-controls-key-a`).addClass('devtools-controls-key-active');
      else $(`#devtools-controls-key-a`).removeClass('devtools-controls-key-active');

      if (d) $(`#devtools-controls-key-d`).addClass('devtools-controls-key-active');
      else $(`#devtools-controls-key-d`).removeClass('devtools-controls-key-active');

      if (space) $(`#devtools-controls-key-space`).addClass('devtools-controls-key-active');
      else $(`#devtools-controls-key-space`).removeClass('devtools-controls-key-active');

      if (shift) $(`#devtools-controls-key-shift`).addClass('devtools-controls-key-active');
      else $(`#devtools-controls-key-shift`).removeClass('devtools-controls-key-active');

    }

    return { emit };
  }());

  return { Components, Visualizer, Abstractor, Input };
}());

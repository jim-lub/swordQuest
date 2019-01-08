/* jshint esversion: 6 */
const Tests = (function() {

  const isEnabled = {
    hitbox: false,
    collisionPoints: false,
    fov: false,
    attackRadius: false
  };

  function drawHitbox(ctx, x, y, width, height) {
    if (!isEnabled.hitbox) return;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  function drawCollisionPoints(ctx, cameraOffset, collisionPoints) {
    if (!isEnabled.collisionPoints) return;

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "orange";
    collisionPoints.forEach(cur => {
      let x = (cameraOffset) ? -Events.listen('CAMERA_OFFSET_X') + cur.x : cur.x;
      ctx.fillRect(Math.round(x - 1.5), Math.round(cur.y - 3), 3, 3);
    });
    ctx.restore();
  }

  function drawFov(ctx, x, y, width, height, range) {
    if (!isEnabled.fov) return;

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(x + (width / 2), y + height, range, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawAttackRadius(ctx, x, y, width, height, range) {
    if (!isEnabled.attackRadius) return;

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x + (width / 2), y + height, range, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function eventHandlers() {
    const elements = [
      ['testsuite-toggle-hitbox', 'hitbox'],
      ['testsuite-toggle-collision-points', 'collisionPoints'],
      ['testsuite-toggle-enemy-fov', 'fov'],
      ['testsuite-toggle-enemy-attackradius', 'attackRadius']
    ];

    elements.forEach(cur => {
      document.getElementById(cur[0]).onclick = function() {
        isEnabled[cur[1]] = (this.checked) ? true : false;
      };
    });
  }

  return {
    drawHitbox,
    drawCollisionPoints,
    drawFov,
    drawAttackRadius,
    eventHandlers
  };
}());
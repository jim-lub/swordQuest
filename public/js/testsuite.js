/* jshint esversion: 6 */
const Tests = (function() {

  const isEnabled = {
    hitbox: true,
    collisionPoints: true,
    fov: false
  };

  function drawHitbox(ctx, x, y, width, height) {
    if (!isEnabled.hitbox) return;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  function drawCollisionPoints(ctx, cameraOffset, collisionPoints) {
    if (!isEnabled.collisionPoints) return;

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'orange';
    collisionPoints.forEach(cur => {
      let x = (cameraOffset) ? -Events.listen('CAMERA_OFFSET_X') + cur.x : cur.x;
      ctx.fillRect(Math.round(x - 1.5), Math.round(cur.y - 3), 3, 3);
    });
    ctx.restore();
  }

  function drawFov(ctx, {fov}) {
    if (!isEnabled.fov) return;
  }

  return {
    drawHitbox,
    drawCollisionPoints,
    drawFov,
    isEnabled
  };
}());

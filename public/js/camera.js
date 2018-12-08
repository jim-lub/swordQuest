/* jshint esversion: 6 */
class Camera {
  constructor() {
    this.offsetX = 0;
    this.offsetY = 0;
  }

  update(pos, vel, direction) {
    if (pos.x <= 300 && direction === 'left') {
      Events.emit('PLAYER_HIT_LEFT_WALL', true);
      this.offsetX += vel.x;
    } else {
      Events.emit('PLAYER_HIT_LEFT_WALL', false);
    }

    if (pos.x >= 880 && direction === 'right') {
      Events.emit('PLAYER_HIT_RIGHT_WALL', true);
      this.offsetX += vel.x;
    } else {
      Events.emit('PLAYER_HIT_RIGHT_WALL', false);
    }
    Events.emit('offsetX', Math.round(this.offsetX));
  }
}

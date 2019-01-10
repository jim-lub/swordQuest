/* jshint esversion: 6 */
class Camera {
  constructor() {
    this.offsetX = 0;
    this.offsetY = 0;
  }

  update() {
    let player = Characters.followCharacterWithCamera();
    let pos = player.position;
    let direction = player.direction;
    let vel = player.velocity;

    if (pos.x <= 200 && direction === 'left') {
      this.offsetX += vel.x;
    }

    if (pos.x >= 700 && direction === 'right') {
      this.offsetX += vel.x;
    }

    Events.emit('CAMERA_OFFSET_X', Math.round(this.offsetX));
  }
}

/* jshint esversion: 6 */
const Camera = (function() {
  const data = {
    offsetX: 0,
    offsetY: 0
  };

  function update() {
    // let player = Enities.followCharacterWithCamera();
    // let pos = player.position;
    // let direction = player.direction;
    // let vel = player.velocity;
    //
    // if (pos.x <= 200 && direction === 'left') {
    //   data.offsetX += vel.x;
    // }
    //
    // if (pos.x >= 700 && direction === 'right') {
    //   data.offsetX += vel.x;
    // }
    //
    // Events.emit('CAMERA_OFFSET_X', data.offsetX);

    Events.emit('CAMERA_OFFSET_X', 0);
  }

  function convertXCoord(coordinate) {
    return coordinate + -Events.listen('CAMERA_OFFSET_X');
  }

  return {
    update,
    convertXCoord
  };
}());

/* jshint esversion: 6 */
const Entities = (function() {

  let ENTITIES = [];

  /********************************************************************************
  * @Public
  * @ Init / update / render
  ********************************************************************************/
  function init(array) {
    ENTITIES = array.map(data => {
      return Characters.create(data);
    });

    console.log(ENTITIES);
  }

  function update(dt) {
    ENTITIES.forEach(entity => {
      entity.update(dt);
    });
  }

  function render(ctx) {
    ENTITIES.forEach(entity => {
      entity.render(ctx);
    });
  }

  return {
    init, update, render,
    ENTITIES // Make private after CollisionDetection update
  };
}());

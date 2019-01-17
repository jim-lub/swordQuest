/* jshint esversion: 6 */
const Entities = (function() {

  let ENTITIES = [];
  let ATTACKS = [];

  /********************************************************************************
  * @ Public
  * -------------------------------------------------------------------------------
  * @Init: -
  * @Update: -
  * @Render: -
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

    ATTACKS = ATTACKS.filter(point => {
      return !point.fade;
    });

    ATTACKS.forEach(point => {
      point.update();
    });
  }

  function render(ctx) {
    ENTITIES.forEach(entity => {
      entity.render(ctx);
    });

    DevTools.Visualizer.start('characterAttackPoints', ctx, {
      offsetX: Camera.convertXCoord(0),
      attackPoints: ATTACKS
    });
  }

  function getAllEntities() {
    return ENTITIES;
  }

  function newAttackPoint(point) {
    ATTACKS.push(point);
  }

  return {
    init, update, render,
    ATTACKS,
    getAllEntities,
    newAttackPoint
  };
}());

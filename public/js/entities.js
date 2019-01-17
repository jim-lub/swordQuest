/* jshint esversion: 6 */
const Entities = (function() {

  let ENTITIES = [];
  let ATTACKS = [];
  let HEALS = [];

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
    // Filter dead entities
    ENTITIES = ENTITIES.filter(entity => {
      return entity.health.current > 0;
    });

    // Call update() on all characters
    ENTITIES.forEach(entity => {
      entity.update(dt);
    });

    // Filter out all points that have a `fade` var that is true
    ATTACKS = ATTACKS.filter(point => {
      return !point.fade;
    });

    // Call update() on all attackPoints
    ATTACKS.forEach(point => {
      point.update();
    });

    // Filter out all points that have a `fade` var that is true
    HEALS = HEALS.filter(point => {
      return !point.fade;
    });

    // Call update() on all attackPoints
    HEALS.forEach(point => {
      point.update();
    });

    // Send data to abstractor
    DevTools.Abstractor.emit({
      name: 'activeEntities',
      text: 'entities: ',
      data: ENTITIES.length
    });
    DevTools.Abstractor.emit({
      name: 'activeAttackPoints',
      text: 'attackPoints: ',
      data: ATTACKS.length
    });
    DevTools.Abstractor.emit({
      name: 'activeHealPoints',
      text: 'healPoints: ',
      data: HEALS.length
    });

  }

  function render(ctx) {
    // Render all characters
    ENTITIES.forEach(entity => {
      entity.render(ctx);
    });

    // Render all attackPoints; development only
    DevTools.Visualizer.start('characterAttackPoints', ctx, {
      offsetX: Camera.convertXCoord(0),
      attackPoints: ATTACKS
    });

    // Render all healPoints; development only
    DevTools.Visualizer.start('characterHealPoints', ctx, {
      offsetX: Camera.convertXCoord(0),
      healPoints: HEALS
    });
  }

  function getAllEntities() {
    return ENTITIES;
  }

  function getAllAttackPoints() {
    return ATTACKS;
  }

  function getAllHealPoints() {
    return HEALS;
  }

  function newAttackPoint(point) {
    ATTACKS.push(point);
  }

  function newHealPoint(point) {
    HEALS.push(point);
  }

  return {
    init, update, render,
    getAllEntities, getAllAttackPoints, getAllHealPoints,
    newAttackPoint, newHealPoint
  };
}());

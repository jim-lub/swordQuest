/* jshint esversion: 6 */
const Combat = (function() {

  function filterAttackPoints(state) {
    let ATTACKS = Entities.getAllAttackPoints();

    return ATTACKS.filter(point => {
      return (Math.abs(state.position.x) - Math.abs(point.position.x)) < 100 && state.id !== point.parentid;
    }).filter(point => {
      return _attackPointCollision(state, point);
    }).map(point => {
      let damage = (_isCriticalHit(point.damage.criticalHitChance)) ? point.damage.criticalHitDamage : point.damage.base;

      return {
        position: {
          x: point.position.x,
          y: point.position.y
        },
        damage: damage,
        isCrit: (damage > point.damage.base)
      };
    });
  }

  function _attackPointCollision(state, point) {
    let collisionX = point.position.x >= state.position.x && point.position.x < state.position.x + state.hitbox.width;
    let collisionY = point.position.y >= state.position.y && point.position.y < state.position.y + state.hitbox.height;

    return (collisionX && collisionY);
  }

  function _isCriticalHit(critchance) {
    return Math.floor(Math.random() * 100 + 1) < critchance;
  }



  function filterHealPoints(state) {
    let HEALS = Entities.getAllHealPoints();

    return HEALS.filter(point => {
      return (Math.abs(state.position.x) - Math.abs(point.position.x)) < 100;
    }).filter(point => {
      return _healPointCollision(state, point);
    }).map(point => {
      let heal = (_isCriticalHeal(5)) ? 5 : 1;

      return {
        position: {
          x: point.position.x,
          y: point.position.y
        },
        heal: heal,
        isCrit: (heal > 1)
      };
    });
  }

  function _healPointCollision(state, point) {
    let collisionX = point.position.x >= state.position.x && point.position.x < state.position.x + state.hitbox.width;
    let collisionY = point.position.y >= state.position.y && point.position.y < state.position.y + state.hitbox.height;

    return (collisionX && collisionY);
  }

  function _isCriticalHeal(critchance) {
    return Math.floor(Math.random() * 100 + 1) < critchance;
  }

  return {
    filterAttackPoints,
    filterHealPoints
  };
}());

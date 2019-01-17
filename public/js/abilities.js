/* jshint esversion: 6 */
const Abilities = (function() {

  /********************************************************************************
  * @Abilities
  * @
  ********************************************************************************/
  const canSwordSlash = (state) => ({
    swordSlash: () => {
      if(_isActiveAttackFrame(state)) {
        _emitAttackPoint(_circularPattern(state, {
          startAngle: 100,
          endAngle: 170,
          scaleModifier: 1,
          pointsToEmit: 10
        }));
      }
    }
  });

  /********************************************************************************
  * @Patterns
  * @
  ********************************************************************************/
  function _circularPattern(state, {startAngle, endAngle, scaleModifier = 1, pointsToEmit = 10}) {
    let originX = state.position.x + state.hitbox.width / 2;
    let originY = state.position.y + state.hitbox.height;

    let pattern = {
      id: Utils.randomID(),
      parentid: state.id,
      origin: new Vector(originX, originY),
      position: new Vector(originX, originY),

      direction: state.direction,
      radius: state.attackRadius * scaleModifier,

      angle: (startAngle / 180) * Math.PI,
      step: ((endAngle / 180) - (startAngle / 180)) * Math.PI / pointsToEmit,
      maxAngle: (endAngle / 180) * Math.PI,

      fade: false,

      update: () => {
        if (pattern.angle >= pattern.maxAngle) pattern.fade = true;

        let modifiedRadius = (pattern.direction === 'left') ? pattern.radius : -pattern.radius;

        let x = pattern.origin.x + (modifiedRadius * Math.cos(pattern.angle));
        let y = pattern.origin.y - pattern.radius * Math.sin(pattern.angle);

        pattern.position = new Vector(x, y);
        pattern.angle += pattern.step;
      }
    };

    return Object.assign(pattern);
  }

  /********************************************************************************
  * @Utilities
  * @
  ********************************************************************************/
  function _emitAttackPoint(point) {
      Entities.newAttackPoint(point);
  }

  function _isActiveAttackFrame(state) {
    return state.animations.activeAttackFrames.filter(i => {
      return i === state.animations.currentIndex;
    }).length > 0;
  }

  return {
    canSwordSlash
  };
}());

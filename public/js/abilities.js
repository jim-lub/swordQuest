/* jshint esversion: 6 */
const Abilities = (function() {

  /********************************************************************************
  * @ Abilities:
  * -------------------------------------------------------------------------------
  * @SwordSlash: a circular sword attack emitting from the character. Characters with a bigger radius will emit more patterns.
  ********************************************************************************/
  const canSwordSlash = (state) => ({
    swordSlash: () => {
      if(_isActiveAttackFrame(state)) {
        _emitAttackPattern(_circularPattern(state, {
          startAngle: 100,
          endAngle: 170,
          scaleModifier: 1,
          pointsToEmit: 10
        }));

        _emitAttackPattern(_circularPattern(state, {
          startAngle: 110,
          endAngle: 150,
          scaleModifier: 0.8,
          pointsToEmit: 5
        }));
      }
    }
  });

  /********************************************************************************
  * @ Circular Pattern:
  * -------------------------------------------------------------------------------
  * @startAngle: attackPoints will start emitting from this angle
  * @endAngle: attackPoints will fade when they have reached this angle
  * @scaleModifier: attackPoints will flow over the edge of the characters' `attackRadius`. To shrink or expand this edge modify this var with a value between `0.1` and `2.0`. Default: 1
  * @pointToEmit: amount of attackPoints to emit. Increasing this number will result in more possible hits on other characters. Default: 10
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
  * @ Utilities
  * -------------------------------------------------------------------------------
  * @_emitAttackPattern: sends the pattern to the entities module
  * @_isActiveAttackFrame: checks the animation frame to see if a new pattern should be emitted
  ********************************************************************************/
  function _emitAttackPattern(point) {
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

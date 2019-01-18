/* jshint esversion: 6 */
const Abilities = (function() {

  /********************************************************************************
  * @ Abilities - create abilities by mixing different patterns
  * -------------------------------------------------------------------------------
  * @SwordSlash: a circular sword attack emitting from the character. Characters with a bigger radius will emit more attackPoints
  * @Heal: emit a healing stream originating blow the character
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

        _emitAttackPoint(_circularPattern(state, {
          startAngle: 115,
          endAngle: 165,
          scaleModifier: 0.8,
          pointsToEmit: 7
        }));

        _emitAttackPoint(_circularPattern(state, {
          startAngle: 130,
          endAngle: 160,
          scaleModifier: 0.6,
          pointsToEmit: 4
        }));
      }
    }
  });

  const canHeal = (state) => ({
    heal: () => {
        _emitHealPoint(_elipticalPattern(state, {
          startAngle: 0,
          endAngle: 60,
          scaleModifierY: 1.5,
          scaleModifierX: 1,
          offsetX: 55,
          offsetY: 0,
          pointsToEmit: 5
        }));

        _emitHealPoint(_elipticalPattern(state, {
          startAngle: 0,
          endAngle: 60,
          scaleModifierY: 1.5,
          scaleModifierX: -1,
          offsetX: -55,
          offsetY: 0,
          pointsToEmit: 5
        }));
    }
  });

  /********************************************************************************
  * @ Circular Pattern:
  * -------------------------------------------------------------------------------
  * @startAngle: attackPoints will start emitting from this angle
  * @endAngle: attackPoints will fade when they have reached this angle
  * @scaleModifier: attackPoints will flow over the edge of the characters' `attackRadius`. To shrink or expand this edge modify this var with a value between `0.1` and `2.0`. Default: 1
  * @offsetX: offset origin on X axis
  * @offsetY: offset origin on Y axis
  * @pointToEmit: amount of attackPoints to emit. Increasing this number will result in more possible hits on other characters. Default: 10
  ********************************************************************************/
  function _circularPattern(state, {startAngle, endAngle, scaleModifier = 1, offsetX = 0, offsetY = 0, pointsToEmit = 10}) {
    let originX = state.position.x + state.hitbox.width / 2 + (offsetX * state.directionInt);
    let originY = state.position.y + state.hitbox.height + offsetY;

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

      damage: state.damage,

      fade: false,

      update: () => _updateCircularPattern(pattern)
    };

    return Object.assign(pattern);
  }

  function _updateCircularPattern(pattern) {
    if (pattern.angle >= pattern.maxAngle) pattern.fade = true;

    let modifiedRadius = (pattern.direction === 'left') ? pattern.radius : -pattern.radius;

    pattern.position = {
      x: pattern.origin.x + (modifiedRadius * Math.cos(pattern.angle)),
      y: pattern.origin.y - pattern.radius * Math.sin(pattern.angle)
    };

    pattern.angle += pattern.step;
  }

  /********************************************************************************
  * @ eliptical Pattern:
  * -------------------------------------------------------------------------------
  * @startAngle: attackPoints will start emitting from this angle
  * @endAngle: attackPoints will fade when they have reached this angle
  * @scaleModifierX: Modify X scale of trajectory
  * @scaleModifierY: Modify Y scale of trajectory
  * @offsetX: offset origin on X axis
  * @offsetY: offset origin on Y axis
  * @pointToEmit: amount of attackPoints to emit. Increasing this number will result in more possible hits on other characters. Default: 10
  ********************************************************************************/
  function _elipticalPattern(state, {startAngle, endAngle, scaleModifierX = 1, scaleModifierY = 1, offsetX, offsetY, pointsToEmit = 10}) {
    let originX = state.position.x + state.hitbox.width / 2 + (offsetX * state.directionInt);
    let originY = state.position.y + state.hitbox.height + offsetY;

    let pattern = {
      id: Utils.randomID(),
      parentid: state.id,
      origin: new Vector(originX, originY),
      position: new Vector(originX, originY),

      direction: state.direction,
      radius: state.attackRadius,

      scaleModifierX,
      scaleModifierY,

      angle: (startAngle / 180) * Math.PI,
      step: ((endAngle / 180) - (startAngle / 180)) * Math.PI / pointsToEmit,
      maxAngle: (endAngle / 180) * Math.PI,

      damage: state.damage,

      fade: false,

      update: () => _updateElipticalPattern(pattern)
    };

    return Object.assign(pattern);
  }

  function _updateElipticalPattern(pattern) {
    if (pattern.angle >= pattern.maxAngle) pattern.fade = true;

    let modifiedRadius = (pattern.direction === 'left') ? pattern.radius : -pattern.radius;

    pattern.position = {
      x: pattern.origin.x + (modifiedRadius * Math.cos(pattern.angle)) * pattern.scaleModifierX,
      y: pattern.origin.y - pattern.radius * Math.sin(pattern.angle) * pattern.scaleModifierY
    };

    pattern.angle += pattern.step;
  }

  /********************************************************************************
  * @ Utilities
  * -------------------------------------------------------------------------------
  * @_emitAttackPoint: sends the point to the entities module
  * @_isActiveAttackFrame: checks the animation frame to see if a new pattern should be emitted
  ********************************************************************************/
  function _emitAttackPoint(point) {
      Entities.newAttackPoint(point);
  }

  function _emitHealPoint(point) {
      Entities.newHealPoint(point);
  }

  function _isActiveAttackFrame(state) {
    return state.animations.activeAttackFrames.filter(i => {
      return i === state.animations.currentIndex;
    }).length > 0;
  }

  return {
    canSwordSlash, canHeal
  };
}());

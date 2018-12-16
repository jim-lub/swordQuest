/* jshint esversion: 6 */
$(document).ready(function(){
  Load.images()
  .then(() => Animations.init())
  .then(() => Game.init())
  .catch(e => console.log(e));
});

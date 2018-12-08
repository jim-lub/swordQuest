/* jshint esversion: 6 */
class Level {
  constructor() {
    this.background = new Parallax();
    this.ticks = 0;
  }


  update() {

  }

  render(ctx) {
    this.background.render(ctx, 'forest');
  }
}

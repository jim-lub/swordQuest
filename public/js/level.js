/* jshint esversion: 6 */
class Level {
  constructor() {
    this.background = new Parallax();
  }

  update() {

  }

  render(ctx) {
    this.background.render(ctx, 'forest');
  }
}

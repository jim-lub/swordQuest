/* jshint esversion: 6 */
class Parallax {
  constructor() {
    this.current = null;
  }

  render(ctx, type) {

    let offsetX = Events.listen('offsetX') || 0;

    ctx.translate(-offsetX, 0);
    ctx.fillStyle = ctx.createPattern(Assets.img('forest', 'forest'), 'repeat-x');
    ctx.fillRect(offsetX, 0, 1280, 640);
    ctx.translate(offsetX, 0);
    // ctx.drawImage(layers[0], 0, 0, data.width, data.height);
  }

}

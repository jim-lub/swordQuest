/* jshint esversion: 6 */
class Parallax {
  constructor() {
    this.current = null;
    this.offsetvisuals = 0;
    this.offsets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  render(ctx, type) {

    let offsetX = Events.listen('offsetX') || 0;
    this.offsetVisuals = offsetX;
    if (Math.round(offsetX) < -928) {
      offsetX = (offsetX + 928);
    }
    if (Math.round(offsetX) > 928) {
      offsetX = (offsetX - 928);
    }
    // console.log(offsetX);
    let offsetY = 0;
    let speed = 0.5;
    for (let i = 0; i < 11; i++) {
      // this.offsets[i] += offsetX * speed / 10;
      let offset = offsetX * speed;
      ctx.drawImage(Assets.img('forest', 'forest'), offset - 927, offsetY, 928, 540, 0, 0, 928, 540);
      ctx.drawImage(Assets.img('forest', 'forest'), offset, offsetY, 928, 540, 0, 0, 928, 540);
      ctx.drawImage(Assets.img('forest', 'forest'), offset + 927, offsetY, 928, 540, 0, 0, 928, 540);

      speed += 0.05;
      offsetY += 540;
    }

    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.5, 0, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.55, 540, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.6, 1080, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.65, 1620, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.7, 2160, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.75, 2700, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.8, 3240, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.85, 3780, 928, 540, 0, 0, 928, 540);
    //
    // ctx.drawImage(Assets.img('forest', 'forest'), (0 + offsetX * 0.9) - 928, 4320, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), (0 + offsetX * 0.9), 4320, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), (0 + offsetX * 0.9) + 928, 4320, 928, 540, 0, 0, 928, 540);
    //
    //
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 0.95, 4860, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(Assets.img('forest', 'forest'), 0 + offsetX * 1, 5400, 928, 540, 0, 0, 928, 540);
    // ctx.drawImage(layers[0], 0, 0, data.width, data.height);
  }

}

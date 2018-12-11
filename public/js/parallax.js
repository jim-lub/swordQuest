/* jshint esversion: 6 */
class Parallax {
  constructor() {
    this.current = null;
    this.offsetvisuals = 0;
    this.offsets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  render(ctx, type) {

    let offsetX = Events.listen('CAMERA_OFFSET_X') || 0;
    let offsetY = 0;
    let speed = 0;
    let section = Math.abs(Math.floor(offsetX / 928)) + 1;

    for (let i = 0; i < 11; i++) {
      let offset = offsetX * speed;
      if (Math.round(offset) < (-928 * section)) offset = (offset + 928 * section);
      if (Math.round(offset) > 928) offset = (offset - 928);

      ctx.drawImage(Assets.img('forest', 'forest'), offset - 927, offsetY, 928, 540, 0, 0, 928, 540);
      ctx.drawImage(Assets.img('forest', 'forest'), offset, offsetY, 928, 540, 0, 0, 928, 540);
      ctx.drawImage(Assets.img('forest', 'forest'), offset + 927, offsetY, 928, 540, 0, 0, 928, 540);

      speed += 0.1;
      offsetY += 540;
    }
  }

}

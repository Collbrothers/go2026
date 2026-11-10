import { UIElement } from "./UIElement.js";

const face = Object.assign(new Image(), { src: "assets/ui/compass.png" });
const arrow = Object.assign(new Image(), { src: "assets/ui/compass-arrow.png" });

export class Compass extends UIElement {
    constructor(opts = {}) {
        super(opts);
        // radians, 0 = straight up. static for now
        this.getAngle = opts.getAngle ?? (() => 0);
    }

    draw(ctx) {
        const { x, y } = this.pos;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(face, x, y, this.width, this.height);
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.rotate(this.getAngle());
        ctx.drawImage(arrow, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

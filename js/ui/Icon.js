import { UIElement } from "./UIElement.js";

export class Icon extends UIElement {
    constructor(opts = {}) {
        super(opts);
        this.getImage = opts.getImage;
    }

    draw(ctx) {
        ctx.drawImage(this.getImage(), this.pos.x, this.pos.y, this.width, this.height);
    }
}

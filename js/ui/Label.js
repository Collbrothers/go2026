import { UIElement } from "./UIElement.js";

export class Label extends UIElement {
    constructor(opts) {
        super(opts);
        this.getText = opts.getText;
        this.height = opts.height ?? 8;
    }

    draw(ctx) {
        const { x, y } = this.pos;
        ctx.fillStyle = "#fff";
        ctx.font = "8px monospace";
        ctx.textBaseline = "top";
        ctx.fillText(this.getText(), x, y);
    }
}

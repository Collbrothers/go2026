import { UIElement } from "./UIElement.js";

export class Bar extends UIElement {
    constructor(opts) {
        super(opts);
        this.getValue = opts.getValue; // callback
        this.max = opts.max;
        this.color = opts.color ?? "#c33";
        this.background = opts.background ?? null;
        this.inset = { left: 0, top: 0, right: 0, bottom: 0, ...opts.inset };
    }

    draw(ctx) {
        const { x, y } = this.pos;
        const ins = this.inset;
        const fx = x + ins.left;
        const fy = y + ins.top;
        const fw = this.width - ins.left - ins.right;
        const fh = this.height - ins.top - ins.bottom;
        const fill = Math.round((fw * Math.max(0, this.getValue())) / this.max);

        if (this.background) {
            ctx.drawImage(this.background, x, y, this.width, this.height);
        } else {
            ctx.fillStyle = "#000";
            ctx.fillRect(x - 1, y - 1, this.width + 2, this.height + 2);
            ctx.fillStyle = "#333";
            ctx.fillRect(x, y, this.width, this.height);
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(fx, fy, fill, fh);
    }
}

import { VIEW_W, VIEW_H } from "../config.js";

export class UIElement {
    constructor({
        anchor = "topleft",
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        debugOnly,
        isVisible,
    } = {}) {
        this.isVisible = isVisible ?? (() => true);
        this.anchor = anchor;
        this.offsetX = x;
        this.offsetY = y;
        this.width = width;
        this.height = height;
        this.debugOnly = debugOnly;
    }

    get pos() {
        const a = this.anchor;

        let x;

        if (a.includes("right")) {
            x = VIEW_W - this.width - this.offsetX;
        } else if (a.includes("center")) {
            x = (VIEW_W - this.width) / 2 + this.offsetX;
        } else {
            x = this.offsetX;
        }

        let y;
        if (a.includes("bottom")) {
            y = VIEW_H - this.height - this.offsetY;
        } else if (a.includes("middle")) {
            y = (VIEW_H - this.height) / 2 + this.offsetY;
        } else {
            y = this.offsetY;
        }

        return { x: Math.round(x), y: Math.round(y) };
    }

    draw() {}
}

import { DEBUG } from "../config.js";

export class UI {
    constructor() {
        this.elements = [];
    }

    add(element) {
        this.elements.push(element);
        return this;
    }

    draw(ctx) {
        ctx.save();
        for (const e of this.elements) {
            if (e.debugOnly && !DEBUG) continue;
            if (!e.isVisible()) continue;
            e.draw(ctx);
        }
        ctx.restore();
    }
}

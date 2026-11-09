class UI {
    constructor() {
        this.elements = [];
    }

    add(element) {
        this.elements.push(element);
        return this;
    }

    draw(ctx) {
        ctx.save();
        for (const e of this.elements){
            if (e.debugOnly && !DEBUG) continue;
            e.draw(ctx);
        }
        ctx.restore();
    }
}
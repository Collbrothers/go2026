class UIElement {
    constructor({ anchor = "topleft", x = 0, y = 0, width = 0, height = 0, debugOnly } = {}) {
        this.anchor = anchor;
        this.offsetX = x;
        this.offsetY = y;
        this.width = width;
        this.height = height;
        this.debugOnly = debugOnly;
    }

    get pos() {
        const right  = this.anchor.includes("right");
        const bottom = this.anchor.includes("bottom");
        return {
            x: Math.round(right  ? VIEW_W - this.width  - this.offsetX : this.offsetX),
            y: Math.round(bottom ? VIEW_H - this.height - this.offsetY : this.offsetY),
        };
    }

    draw() {}
}
class Bar extends UIElement {
    constructor(opts) {
        super(opts);
        this.getValue = opts.getValue; // callback
        this.max = opts.max;
        this.color = opts.color ?? "#c33";
    }

    draw() {
        const { x, y } = this.pos;
        const fill = Math.round(this.width * Math.max(0, this.getValue()) / this.max);

        vctx.fillStyle = "#000";
        vctx.fillRect(x - 1, y - 1, this.width + 2, this.height + 2);
        vctx.fillStyle = "#333";
        vctx.fillRect(x, y, this.width, this.height);
        vctx.fillStyle = this.color;
        vctx.fillRect(x, y, fill, this.height);
    }
}
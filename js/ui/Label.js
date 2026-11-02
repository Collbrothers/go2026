class Label extends UIElement {
    constructor(opts) {
        super(opts);
        this.getText = opts.getText;
        this.height = opts.height ?? 8;
    }

    draw() {
        const { x, y } = this.pos;
        vctx.fillStyle = "#fff";
        vctx.font = "8px monospace";
        vctx.textBaseline = "top";
        vctx.fillText(this.getText(), x, y);
    }
}
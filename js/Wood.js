class Wood extends GameObject {
    constructor(opts) {
        super(opts);
    }

    draw(ctx) {
        ctx.fillStyle = "brown";
        ctx.fillRect(
            Math.round(this.coordinate.x - this.width / 2),
            Math.round(this.coordinate.y - this.height / 2),
            this.width, this.height
        );
    }
}
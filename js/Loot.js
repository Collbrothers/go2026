class Loot extends GameObject {
    constructor(opts) {
        super(opts);
        this.collected = false;
    }

    draw(ctx) {
        ctx.fillStyle = "gold";
        ctx.fillRect(
            Math.round(this.coordinate.x - this.width / 2),
            Math.round(this.coordinate.y - this.height / 2),
            this.width, this.height
        );
    }
}
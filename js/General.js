class General extends GameObject {
    constructor(opts = {}) {
        super(opts);
        this.name = opts.name;
    }

    draw(ctx) {
        const bobAnimation = Math.round(Math.sin(performance.now() / 400 + this.coordinate.x) * 2);

        ctx.fillStyle = "#8a3bc6";
        ctx.fillRect(this.coordinate.x - this.width / 2, this.coordinate.y - this.height / 2, this.width, this.height);
        ctx.strokeStyle = "#3e2a4c";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.coordinate.x - this.width / 2, this.coordinate.y - this.height / 2, this.width - 1, this.height - 1);
    }
}
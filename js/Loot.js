class Loot extends GameObject {
    constructor(opts) {
        super(opts);
        this.sprite = new Image();
        this.sprite.src = "sinking_chest.png";
    }

    draw(ctx) {
        ctx.fillStyle = "gold";
        ctx.drawImage(this.sprite, this.coordinate.x, this.coordinate.y, 32, 32);
        /*ctx.fillRect(
            Math.round(this.coordinate.x - this.width / 2),
            Math.round(this.coordinate.y - this.height / 2),
            this.width, this.height
        );*/
    }
}
class Loot extends GameObject {
    constructor(opts) {
        super(opts);
        this.sprite = new Image();
        this.sprite.src = "sinking_chest.png";
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.coordinate.x, this.coordinate.y, 32, 32);
    }
}
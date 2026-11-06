class Loot extends GameObject {
    static frames = ["sinking_chest.png", "chest_sinking_almost.png", "sunken-chest.png"].map(src =>
        Object.assign(new Image(), { src })
    );
    static sequence = [0, 1, 2, 1];

    constructor(opts) {
        super(opts);
        this.interval = 0.35;
        this.phase = Math.random() * 4;
    }

    draw(ctx) {
        const t = performance.now() / 1000 + this.phase;
        const step = Math.floor(t / this.interval) % Loot.sequence.length;
        const img = Loot.frames[Loot.sequence[step]];

        ctx.drawImage(
            img,
            Math.round(this.coordinate.x - 16),
            Math.round(this.coordinate.y - 16),
            32, 32
        );
    }
}
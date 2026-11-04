class DynamicObject extends GameObject {
    constructor(opts = {}) {
        super(opts);
        this.direction = opts.direction ?? 0;
        this.speed = opts.speed ?? 0;
        this.acceleration = opts.acceleration ?? 0;
        this.minSpeed = opts.minSpeed ?? -50;
        this.maxSpeed = opts.maxSpeed ?? 100;
    }

    update(dt) {}

    draw(dt) {}
}
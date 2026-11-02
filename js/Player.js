class Player extends DynamicObject {
    constructor(opts = {}) {
        super(opts);
        this.visibleRadius = 150;
        this.health = 100; // not implemented hehe
        this.turnRate = 2;
        this.sprite = new Image();
        this.sprite.src = "boat.png";
    }

    update(dt) {
        if (state["KeyA"] || state["ArrowLeft"]) this.direction -= this.turnRate * dt;
        if (state["KeyD"] || state["ArrowRight"]) this.direction += this.turnRate * dt;

        if (state["KeyW"] || state["ArrowUp"]) {
            this.speed = Math.min(this.speed + this.acceleration * dt, this.maxSpeed);
        } else {
            this.speed = Math.max(this.speed - this.acceleration * 0.5 * dt, 0);
        }

        this.coordinate.x += Math.cos(this.direction) * this.speed * dt;
        this.coordinate.y += Math.sin(this.direction) * this.speed * dt;
    }

    draw(ctx) {
        const x = Math.round(this.coordinate.x);
        const y = Math.round(this.coordinate.y);
        const w = this.width;
        const h = this.height;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.direction + Math.PI / 2);
        ctx.drawImage(this.sprite, -32, -32);
        ctx.restore();

        // draw rectangle as boat for now
        if (DEBUG) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.direction);

            ctx.fillStyle = "blue";
            ctx.fillRect(-w / 2, -h / 2, w, h);
            ctx.fillStyle = "red";
            ctx.fillRect(w / 2 - 4, -8, 16, 16);
            ctx.restore();

            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.arc(x, y, this.visibleRadius, 0, Math.PI * 2);
            ctx.stroke();

        }
    }
}
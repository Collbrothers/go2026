class Player extends DynamicObject {
    constructor(opts = {}) {
        super(opts);
        this.visibleRadius = 0;
        this.baseRadius = 100;
        this.health = 100;
        this.gas = 100;
        this.turnRate = 2;
        this.lightLevel = 1;
        this.lanternDuration = 15;
        this.darkDamage = 5;
        this.sprite = new Image();
        this.sprite.src = "boat.png";
        this.lanternOn = true;
        this.inventory = new Inventory(3);

        document.addEventListener("keydown", e => {
            if (e.code !== "KeyF" || e.repeat) return;
            if (this.lanternOn) this.lanternOn = false;
            else if (this.gas > 0) this.lanternOn = true;
        });
    }

    update(dt) {
        this.lightLevel += ((this.lanternOn ? 1 : 0) - this.lightLevel) * Math.min(1, 6 * dt);

        for (let i = 1; i <= this.inventory.size; i++) {
            if (state[`Digit${i}`] === true) {
                this.inventory.select(i - 1);
            }
        }

        if (state["KeyA"] || state["ArrowLeft"]) this.direction -= this.turnRate * dt;
        if (state["KeyD"] || state["ArrowRight"]) this.direction += this.turnRate * dt;

        if (state["KeyW"] || state["ArrowUp"]) {
            this.speed = Math.min(this.speed + this.acceleration * dt, this.maxSpeed);
        } else if (state["KeyS"] || state["ArrowDown"]){
            this.speed = Math.max(this.speed - this.acceleration * dt, this.minSpeed);
        }else {
            this.speed = this.speed < 0 ? Math.min(this.speed + this.acceleration * 0.5 * dt, 0) :  Math.max(this.speed - this.acceleration * 0.5 * dt, 0);
        }

        if (this.lanternOn) {
            this.gas = Math.max(this.gas - (100 / this.lanternDuration) * dt, 0);
            if (this.gas <= 0) this.lanternOn = false;
        } else {
            this.health = Math.max(this.health - this.darkDamage * dt, 0);
        }

        this.coordinate.x += Math.cos(this.direction) * this.speed * dt;
        this.coordinate.y += Math.sin(this.direction) * this.speed * dt;
    }

    draw(ctx) {
        const x = Math.round(this.coordinate.x);
        const y = Math.round(this.coordinate.y);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.direction + Math.PI / 2);
        ctx.drawImage(this.sprite, -32, -32);
        ctx.restore();

        if (DEBUG) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                x - this.width / 2 + 0.5,
                y - this.height / 2 + 0.5,
                this.width - 1,
                this.height - 1
            );

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.direction);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.width / 2 + 8, 0);
            ctx.stroke();
            ctx.restore();

            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.arc(x, y, this.visibleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, 100);
    }

    fuel(amount) {
        this.gas = Math.min(this.gas + amount, 100);
    }
}
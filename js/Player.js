class Player extends DynamicObject {
    constructor(opts = {}) {
        super(opts);
        this.visibleRadius = 0;
        this.baseRadius = 100;
        this.health = 100;
        this.gas = 100;
        this.psyche = 100;
        this.turnRate = 2;
        this.sprite = new Image();
        this.sprite.src = "boat.png";
        this.lanternOn = true;
        this.tickDate = Date.now();

        document.addEventListener("keydown", e => {
            if (e.code === "KeyF") {
                if (this.lanternOn) {
                    this.lanternOn = false;
                    this.lanternDateOff = Date.now();
                } else if (this.gas > 0) {
                    this.lanternOn = true;
                }
            }
        })
    }

    update(dt) {
        if (state["KeyA"] || state["ArrowLeft"]) this.direction -= this.turnRate * dt;
        if (state["KeyD"] || state["ArrowRight"]) this.direction += this.turnRate * dt;

        if (state["KeyW"] || state["ArrowUp"]) {
            this.speed = Math.min(this.speed + this.acceleration * dt, this.maxSpeed);
        } else if (state["KeyS"] || state["ArrowDown"]){
            this.speed = Math.max(this.speed - this.acceleration * dt, this.minSpeed);
        }else {
            this.speed = this.speed < 0 ? Math.min(this.speed + this.acceleration * 0.5 * dt, 0) :  Math.max(this.speed - this.acceleration * 0.5 * dt, 0);
        }

        if (Date.now() - this.tickDate > 1000) {
            if(Date.now() - this.lanternDateOff > 5000 && !this.lanternOn) this.psyche -= 1;
            this.calculateAndTakeDamage()
            this.tickDate = Date.now();
        }

        this.coordinate.x += Math.cos(this.direction) * this.speed * dt;
        this.coordinate.y += Math.sin(this.direction) * this.speed * dt;
    }

    calculateAndTakeDamage() {
        if (this.lanternOn) {
            this.gas = Math.max(this.gas - 1, 0);
            if (this.gas <= 0) {
                this.lanternOn = false;
                this.lanternDateOff = Date.now();
            }
            this.psyche = Math.min(this.psyche + 1, 100);
        } else if (this.psyche < 50) {
            this.health -= 1;
        }
    }

    drawLantern() {
        const cx = VIEW_W / 2;
        const cy = VIEW_H / 2;
        const r = this.visibleRadius;
        const g = vctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        if (!this.lanternOn || this.gas <= 0) g.addColorStop(0, "rgb(62 58 55 / 0.6)");
        else g.addColorStop(0, "rgba(255, 190, 80, 0.30)");
        g.addColorStop(1, "rgba(255, 190, 80, 0)");

        vctx.save();
        vctx.fillStyle = g;
        vctx.beginPath();
        vctx.arc(cx, cy, r, 0, Math.PI * 2);
        vctx.fill();
        vctx.restore();
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
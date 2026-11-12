import { DynamicObject } from "./DynamicObject.js";
import { Inventory } from "./Inventory.js";
import { state } from "./state.js";
import { DEBUG, WORLD_SIZE } from "./config.js";

export class Player extends DynamicObject {
    static BOAT_DIRS = {
        on: "assets/boat/lamp_on/",
        off: "assets/boat/lamp_off/",
    };
    static BOAT_FRAMES = [
        "boat_row_1",
        "boat_row_2",
        "boat_row_3",
        "boat_turn_left_1",
        "boat_turn_left_2",
        "boat_turn_right_1",
        "boat_turn_right_2",
        "boat_pivot_left",
        "boat_pivot_right",
    ];
    // oars front > middle > back > middle > loop
    static ROW_SEQ = ["boat_row_1", "boat_row_2", "boat_row_3", "boat_row_2"];
    static IDLE_FRAME = "boat_row_2";
    static ROW_FPS = 5;

    static boatSprites = null;

    static loadBoatSprites() {
        if (Player.boatSprites) return;
        Player.boatSprites = { on: {}, off: {} };
        for (const variant of ["on", "off"]) {
            for (const name of Player.BOAT_FRAMES) {
                const img = new Image();
                img.src = `${Player.BOAT_DIRS[variant]}${name}.png`;
                Player.boatSprites[variant][name] = img;
            }
        }
    }

    constructor(opts = {}) {
        super(opts);
        this.visibleRadius = 0;
        this.baseRadius = 100;
        this.health = 100;
        this.gas = 100;
        this.turnRate = 2;
        this.lightLevel = 1;
        this.lanternDuration = 20;
        this.darkDamage = 5;
        this.lanternOn = true;
        this.inventory = new Inventory(3);

        Player.loadBoatSprites();
        this.animTime = 0;
        this.rowing = false;
        this.turning = 0; // -1 left, 0 none, 1 right

        document.addEventListener("keydown", (e) => {
            if (e.code === "KeyF" || e.code === "KeyN") {
                if (this.lanternOn) this.lanternOn = false;
                else if (this.gas > 0) this.lanternOn = true;
            }
        });
    }

    update(dt) {
        this.lightLevel += ((this.lanternOn ? 1 : 0) - this.lightLevel) * Math.min(1, 6 * dt);

        for (let i = 1; i <= this.inventory.size; i++) {
            if (state[`Digit${i}`] === true) {
                this.inventory.select(i - 1);
            }
        }

        const left = state["KeyA"] || state["ArrowLeft"];
        const right = state["KeyD"] || state["ArrowRight"];
        const forward = state["KeyW"] || state["ArrowUp"];
        const back = state["KeyS"] || state["ArrowDown"];

        if (left) this.direction -= this.turnRate * dt;
        if (right) this.direction += this.turnRate * dt;

        if (forward) {
            this.speed = Math.min(this.speed + this.acceleration * dt, this.maxSpeed);
        } else if (back) {
            this.speed = Math.max(this.speed - this.acceleration * dt, this.minSpeed);
        } else {
            this.speed =
                this.speed < 0
                    ? Math.min(this.speed + this.acceleration * 0.5 * dt, 0)
                    : Math.max(this.speed - this.acceleration * 0.5 * dt, 0);
        }

        this.turning = (right ? 1 : 0) - (left ? 1 : 0);
        this.rowing = !!(forward || back);
        if (this.rowing) {
            this.animTime += dt * Player.ROW_FPS * (back && !forward ? -1 : 1);
            // keep it between 0 and 4 so it works as a frame index (goes negative when rowing back)
            if (this.animTime < 0) this.animTime += 4;
            if (this.animTime >= 4) this.animTime -= 4;
        }

        if (this.lanternOn) {
            this.gas = Math.max(this.gas - (100 / this.lanternDuration) * dt, 0);
            if (this.gas <= 0) this.lanternOn = false;
        } else {
            this.health = Math.max(this.health - this.darkDamage * dt, 0);
        }

        this.coordinate.x += Math.cos(this.direction) * this.speed * dt;
        this.coordinate.y += Math.sin(this.direction) * this.speed * dt;

        // dont let the boat leave the world
        const edge = WORLD_SIZE / 2;
        this.coordinate.x = Math.max(-edge, Math.min(edge, this.coordinate.x));
        this.coordinate.y = Math.max(-edge, Math.min(edge, this.coordinate.y));
    }

    boatFrameName() {
        const frame = Math.floor(this.animTime); // 0-3

        if (this.turning === -1) {
            if (!this.rowing) return "boat_pivot_left";
            return frame < 2 ? "boat_turn_left_1" : "boat_turn_left_2";
        }
        if (this.turning === 1) {
            if (!this.rowing) return "boat_pivot_right";
            return frame < 2 ? "boat_turn_right_1" : "boat_turn_right_2";
        }

        if (this.rowing) return Player.ROW_SEQ[frame];
        return Player.IDLE_FRAME;
    }

    draw(ctx) {
        const x = Math.round(this.coordinate.x);
        const y = Math.round(this.coordinate.y);

        const set = Player.boatSprites[this.lanternOn ? "on" : "off"];
        const img = set[this.boatFrameName()];

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.direction + Math.PI / 2);
        ctx.drawImage(img, -32, -32);
        ctx.restore();

        if (DEBUG) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(
                x - this.width / 2 + 0.5,
                y - this.height / 2 + 0.5,
                this.width - 1,
                this.height - 1,
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
        this.gas = Math.max(0, Math.min(this.gas + amount, 100));
    }
}

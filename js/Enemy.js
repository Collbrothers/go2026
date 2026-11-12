import { DynamicObject } from "./DynamicObject.js";
import { DEBUG, AUDIO } from "./config.js";
import { Speaker, VOICES } from "./audio.js";

export class Enemy extends DynamicObject {
    constructor(opts = {}) {
        super(opts);
        this.target = opts.target; // Player
        this.radius = 160;
        this.closeRadius = 60; // The radius where enemy is able to shoot even if the lantern is off
        this.turnRate = 0.6;
        this.huntTurnRate = 2.5;
        this.aimError = 120;
        this.aimInterval = 2; // How long to wait between new aiming by the enemy
        this.aimTimer = 0;
        this.aim = null;
        this.searchTime = 0;
        this.maxSearchTime = 20;
        this.stopDistance = 59; // How far away should the enemy stop when hunting player
        this.lastKnown = null; // The last known position of the player, so it becomes more hunt-like
        this.huntAim = null;
        this.huntAimTimer = 0;
        this.damage = 5;
        this.fireInterval = 3;
        this.loseTime = 4;
        this.outTimer = 0;
        this.state = "searching"; // searching || hunting
        this.cooldown = 0;
        this.loseTimer = 0;
        this.flash = 0;

        this.voice = new Speaker({
            voices: VOICES.enemy,
            getPos: () => this.coordinate,
            range: AUDIO.enemyRange,
        });
        this.firstShot = true; // TSIF only on first shot
        this.postFireTimer = 0;

        this.sprite = Object.assign(new Image(), { src: "assets/boat/jollyboat.png" });
    }

    update(dt) {
        const t = this.target;
        const dx = t.coordinate.x - this.coordinate.x;
        const dy = t.coordinate.y - this.coordinate.y;
        const inCircle = Math.hypot(dx, dy) <= this.effectiveRadius;
        this.inCircle = inCircle;
        this.flash = Math.max(0, this.flash - dt);

        if (this.state === "searching") {
            if (inCircle) {
                this.state = "hunting";
                this.cooldown = 0;
                this.firstShot = true;
                this.voice.say("player_discovered", { interrupt: true });
            } else {
                this.search(dt);
                return;
            }
        }

        // Hunting
        if (inCircle) {
            this.lastKnown = { x: t.coordinate.x, y: t.coordinate.y };
            this.cooldown -= dt;
            if (this.cooldown <= 0) {
                this.voice.shot(this.firstShot ? "rifle_fire":"rifle_fire");
                t.health -= this.damage;
                this.cooldown = this.fireInterval;
                this.flash = 0.1;

                
                this.voice.say(this.firstShot ? "firing_first" : "firing");
                this.firstShot = false;
                if (Math.random() < AUDIO.postFiringChance)
                    this.postFireTimer = AUDIO.postFiringDelay;
            }
        }

        if (this.postFireTimer > 0) {
            this.postFireTimer -= dt;
            if (this.postFireTimer <= 0) this.voice.say("post_firing");
        }

        this.hunt(dt);

        // Escape sequence
        if (!inCircle && !t.lanternOn) {
            this.loseTimer += dt;
            if (this.loseTimer >= this.loseTime) {
                this.active = false;
                this.voice.say("player_lost", { interrupt: true });
            }
        } else {
            this.loseTimer = 0;
        }

        if (!inCircle && t.lanternOn) {
            this.outTimer += dt;
            if (this.outTimer >= this.loseTime) {
                this.state = "searching";
                this.outTimer = 0;
                this.searchTime = 0;
                this.aim = null;
                this.lastKnown = null;
                this.postFireTimer = 0;
                this.voice.say("player_lost", { interrupt: true });
            }
        } else {
            this.outTimer = 0;
        }
    }

    hunt(dt) {
        if (!this.lastKnown) return;

        const dx = this.lastKnown.x - this.coordinate.x;
        const dy = this.lastKnown.y - this.coordinate.y;
        const dist = Math.hypot(dx, dy);

        // Travel to last seen at maxSpeed
        if (dist > this.stopDistance) {
            this.steer(this.lastKnown.x, this.lastKnown.y, this.huntTurnRate, this.maxSpeed, dt);
            return;
        }

        // Player inr ange
        if (this.inCircle) {
            this.steer(this.lastKnown.x, this.lastKnown.y, this.huntTurnRate, 0, dt);
        }

        // At last seen but player is gone, go around randomly
        this.huntAimTimer -= dt;
        if (this.huntAimTimer <= 0 || !this.huntAim) {
            this.huntAimTimer = 1.5;
            this.huntAim = {
                x: this.lastKnown.x + (Math.random() * 2 - 1) * 80,
                y: this.lastKnown.y + (Math.random() * 2 - 1) * 80,
            };
        }
        this.steer(this.huntAim.x, this.huntAim.y, this.turnRate, this.maxSpeed * 0.5, dt);
    }

    steer(tx, ty, turnRate, speed, dt) {
        let diff = Math.atan2(ty - this.coordinate.y, tx - this.coordinate.x) - this.direction;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const maxTurn = turnRate * dt;
        this.direction += Math.max(-maxTurn, Math.min(maxTurn, diff));

        this.coordinate.x += Math.cos(this.direction) * speed * dt;
        this.coordinate.y += Math.sin(this.direction) * speed * dt;
    }

    search(dt) {
        const t = this.target.coordinate;

        // Refresh old aim
        this.aimTimer -= dt;
        if (this.aimTimer <= 0 || !this.aim) {
            this.aimTimer = this.aimInterval;
            this.aim = {
                x: t.x + (Math.random() * 2 - 1) * this.aimError,
                y: t.y + (Math.random() * 2 - 1) * this.aimError,
            };
        }

        // Turn towards the aim point
        let diff =
            Math.atan2(this.aim.y - this.coordinate.y, this.aim.x - this.coordinate.x) -
            this.direction;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const maxTurn = this.turnRate * dt;
        this.direction += Math.max(-maxTurn, Math.min(maxTurn, diff));

        this.coordinate.x += Math.cos(this.direction) * this.maxSpeed * dt;
        this.coordinate.y += Math.sin(this.direction) * this.maxSpeed * dt;

        // Give up the search
        this.searchTime += dt;
        if (this.searchTime > this.maxSearchTime) {
            if (DEBUG) console.log("Enemy: Despawn");
            this.active = false;
        }
    }

    draw(ctx) {
        const x = Math.round(this.coordinate.x);
        const y = Math.round(this.coordinate.y);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.direction + Math.PI / 2);
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        if (this.flash > 0) {
            ctx.strokeStyle = "yellow";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(Math.round(this.target.coordinate.x), Math.round(this.target.coordinate.y));
            ctx.stroke();
        }

        if (DEBUG) {
            ctx.strokeStyle = this.state === "hunting" ? "red" : "orange";
            ctx.beginPath();
            ctx.arc(x, y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, this.closeRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Get the effective radius for the enemies shooting, depending on if the lantern is lit or not
    get effectiveRadius() {
        return this.target.lanternOn ? this.radius : this.closeRadius;
    }
}

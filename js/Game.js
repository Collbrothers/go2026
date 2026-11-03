class Game {
    constructor() {
        this.player = new Player({
            coordinate: new Coordinate(0, 0),
            width: 64,
            height: 64,
            acceleration: 60,
            maxSpeed: 120,
        });
        this.objects = [this.player];
        this.loot = [];
        this.spawnLoot(50)
        this.ui = new UI()
            .add(
                new Bar({
                    anchor: "topright",
                    x: 8,
                    y: 8,
                    width: 100,
                    height: 8,
                    getValue: () => this.player.health,
                    color: "#078723",
                    max: 100
                })
            )
            .add(
                new Bar({
                    anchor: "topright",
                    x: 8,
                    y: 32,
                    width: 100,
                    height: 8,
                    getValue: () => this.player.psyche,
                    color: "#743485",
                    max: 100
                })
            )
            .add(
                new Label({
                    anchor: "topright",
                    x: 8,
                    y: 56,
                    width: 100,
                    getText: () => `H${this.player.health}, G${this.player.gas}, P${this.player.psyche}`,
                    debugOnly: true
                })
            )
            .add(
                new Label({
                    anchor: "topright",
                    x: 8,
                    y: 80,
                    width: 100,
                    getText: () => `${Math.round(this.player.coordinate.x)}, ${Math.round(this.player.coordinate.y)}`,
                    debugOnly: true
                })
            )
            .add(
                new Bar({
                    anchor: "topleft",
                    x: 8,
                    y: 8,
                    width: 100,
                    height: 8,
                    getValue: () => this.player.gas,
                    color: "#E37C07",
                    max: 100
                })
            )
        this.last = 0;
        this.lastHealthTick = Date.now();
    }

    start() {
        this.initListeners();
        requestAnimationFrame((t) => this.gameloop(t));
    }

    spawnLoot(count) {
        this.loot = [];
        const half = WORLD_SIZE / 2;
        while (this.loot.length < count) {
            const x = (Math.random() - 0.5) * WORLD_SIZE;
            const y = (Math.random() - 0.5) * WORLD_SIZE;

            // continue if 150px close to the start
            if (Math.hypot(x, y) < 150) continue;
            if (Math.random() < 0.5) {
                this.loot.push(new Loot({ coordinate: new Coordinate(x, y), width: 16, height: 16 }));
            } else {
                this.loot.push(new Wood({ coordinate: new Coordinate(x, y), width: 16, height: 16 }));
            }
        }
    }

    initListeners() {
        document.addEventListener("keydown", (e) => { state[e.code] = true; });
        document.addEventListener("keyup", (e) => { state[e.code] = false; });
    }

    gameloop(now) {
        if (!this.last) this.last = now;
        const dt = Math.min((now - this.last) / 1000, 0.1);
        this.last = now;

        this.checkCollision();

        for (const obj of this.objects) {
            obj.update(dt);
        }

        for (const loot of this.loot) {
            if (!loot.active) this.loot.splice(this.objects.indexOf(loot), 1);
        }

        vctx.fillStyle = "#2a6fb0";
        vctx.fillRect(0, 0, VIEW_W, VIEW_H);

        const p = this.player.coordinate;
        vctx.save();
        vctx.translate(VIEW_W / 2 - Math.round(p.x), VIEW_H / 2 - Math.round(p.y));

        if (DEBUG) this.drawDebugGrid();

        for (const l of this.loot) {
            if (Math.abs(l.coordinate.x - p.x) > VIEW_W / 2 + 32) continue;
            if (Math.abs(l.coordinate.y - p.y) > VIEW_H / 2 + 32) continue;
            l.draw(vctx);
        }
        for (const o of this.objects) o.draw(vctx);

        vctx.restore();

        this.drawVisionBubble();
        this.player.drawLantern();
        this.ui.draw(vctx);

        ctx.drawImage(view, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame((t) => this.gameloop(t));
    }

    checkCollision() {
        for (const loot of this.loot) {
            if (!loot.active) continue;

            if (loot instanceof Loot && this.player.collidesWith(loot)) {
                this.player.heal(Math.floor(Math.random() * 20) + 10);
                loot.active = false;
            } else if (loot instanceof Wood && this.player.collidesWith(loot)) {
                this.player.fuel(15);
                loot.active = false;
            }
        }
    }

    drawVisionBubble() {
        const cx = VIEW_W / 2;
        const cy = VIEW_H / 2;
        const r = this.player.visibleRadius;

        // Dark outside the bubble
        vctx.save();
        if (DEBUG) vctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        else vctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        vctx.beginPath();
        vctx.rect(0, 0, VIEW_W, VIEW_H);
        vctx.arc(cx, cy, r, 0, Math.PI * 2);
        vctx.fill("evenodd"); // holy claude code review find
        vctx.restore();
    }

    drawDebugGrid() {
        const p = this.player.coordinate;
        const step = 64;
        const x0 = Math.floor((p.x - VIEW_W / 2) / step) * step;
        const y0 = Math.floor((p.y - VIEW_H / 2) / step) * step;
        vctx.fillStyle = "#ffffff55";
        for (let x = x0; x < p.x + VIEW_W / 2 + step; x += step)
            for (let y = y0; y < p.y + VIEW_H / 2 + step; y += step)
                vctx.fillRect(x - 1, y - 1, 3, 3);
    }
}
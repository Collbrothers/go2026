class Game {
    constructor() {
        this.player = new Player({
            coordinate: new Coordinate(0, 0),
            width: 64,
            height: 64,
            acceleration: 60,
            minSpeed:-50,
            maxSpeed: 120
        });
        this.objects = [
            this.player,
            new Enemy({
                coordinate: new Coordinate(200, 800),
                width: 64, height: 64,
                target: this.player,
                maxSpeed: 120,
                acceleration: 60,
            })
        ];
        this.state = "playing"; // playing || lost || won || intro (maybe).
        this.loot = [];
        this.sprite = new Image();
        this.sprite.src = "sea.png"

        this.sprite.onload = () => {
            this.waterPattern = vctx.createPattern(this.sprite, "repeat");
        };
        this.waterPattern = "#2a6fb0";

        this.spawnLoot(500);

        this.chestTimer = 0;
        for (let i = 0; i < CHESTS.max; i++) this.spawnChest();

        this.rescue = {
            phase: "generals", // generals || land
            index: 0,
            target: null, // current general in the water
            land: null, // coords of the island, sets when phase is land
            timeLeft: 0,
            age: 0, // seconds since target general spawned
            arcOffset: 0, // idk broski trello says "general direction"
        };

        this.spawnGeneral();
        console.log(this.rescue.target.coordinate)

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
                new Label({
                    anchor: "topright",
                    x: 8,
                    y: 56,
                    width: 100,
                    getText: () => `H${Math.floor(this.player.health)}, G${Math.floor(this.player.gas)}`,
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
            .add(new Hotbar({ anchor: "bottomcenter", y: 8, getInventory: () => this.player.inventory }))
        this.last = 0;
    }

    start() {
        this.initListeners();
        requestAnimationFrame((t) => this.gameloop(t));
    }

    spawnLoot(count) {
        while (this.loot.length < count) {
            const x = (Math.random() - 0.5) * WORLD_SIZE;
            const y = (Math.random() - 0.5) * WORLD_SIZE;

            // continue if 150px close to the start
            if (Math.hypot(x, y) < 150) continue;
            this.loot.push(new Wood({ coordinate: new Coordinate(x, y), width: 16, height: 16 }));
        }
    }


    updateChests(dt) {
        let count = 0;

        for (const loot of this.loot) {
            if(!(loot instanceof Loot) || !loot.active) continue;
            if (Math.abs(loot.coordinate.x - this.player.coordinate.x) > (CHESTS.areaSize / 2) || Math.abs(loot.coordinate.y - this.player.coordinate.y) > (CHESTS.areaSize / 2)) {
                loot.active = false; // despawn loot if its outside the area of chest spawns
            } else {
                count++;
            }

        }

        this.chestTimer -= dt;
        if (count < CHESTS.maxPerArea && this.chestTimer <= 0) {
            this.spawnChest();
            this.chestTimer = CHESTS.spawnInterval;
        }
    }


    spawnChest() {
        for (let i = 0; i < 20; i++) {
            const x = this.player.coordinate.x + (Math.random() * 2 - 1) * (CHESTS.areaSize / 2);
            const y = this.player.coordinate.y + (Math.random() * 2 - 1) * (CHESTS.areaSize / 2);
            if (Math.hypot(x - this.player.coordinate.x, y - this.player.coordinate.y) < (this.player.baseRadius + CHESTS.safeMargin)) continue;
            this.loot.push(new Loot({ coordinate: new Coordinate(x, y), width: 16, height: 16 }));
            return true;
        }
        return false;
    }


    randomCoordinateFromCoordinate(coordinate, minDist, maxDist) {
        const limit = WORLD_SIZE / 2 - 100; // Limits coordinate from world border by 100 px
        let x,y;

        for (;;) {
            const angle = Math.random() * Math.PI * 2;
            const distance = minDist + Math.random() * (maxDist - minDist);
            x = coordinate.x + Math.cos(angle) * distance;
            y = coordinate.y + Math.sin(angle) * distance;

            if (Math.abs(x) <= limit && Math.abs(y) <= limit) return new Coordinate(x, y)
        }


    }

    spawnGeneral() {
        const pos = this.randomCoordinateFromCoordinate(this.player.coordinate, RESCUE.minDist, RESCUE.maxDist);
        const dist = Math.hypot(pos.x, pos.y);

        this.rescue.target = new General({
            coordinate: pos,
            width: 16,
            height: 16,
            name: GENERALS[this.rescue.index].name
        });

        this.rescue.timeLeft = dist / this.player.maxSpeed + RESCUE.bufferTime;
        this.rescue.age = 0;

        this.rescue.arcOffset = 0; // TODO: add a bit of randomness
    }

    updateRescue(dt) {
        // TODO: check if phase is land, do the whole winning state then, check if boat collides with general
        this.rescue.age += dt;
        this.rescue.timeLeft -= dt;

        if (this.rescue.timeLeft <= 0) this.state = "lost";
    }

    drawTargetHint() {
        if (this.rescue.phase !== "generals" || !this.rescue.target) return;

        if (this.rescue.age % (2 * RESCUE.hintVisibilitySeconds) >= RESCUE.hintVisibilitySeconds) return;

        const p = this.player.coordinate;
        const t = this.rescue.target.coordinate;
        const angle = Math.atan2(t.y - p.y, t.x - p.x) + this.rescue.arcOffset;

        vctx.save();
        vctx.strokeStyle = "#ffd866";
        vctx.lineWidth = 3;
        vctx.beginPath();
        vctx.arc(VIEW_W / 2, VIEW_H / 2, this.player.visibleRadius + 12, angle - Math.PI / 3, angle + Math.PI / 3);
        vctx.stroke();
        vctx.restore();

    }

    initListeners() {
        document.addEventListener("keydown", (e) => { state[e.code] = true; });
        document.addEventListener("keyup", (e) => { state[e.code] = false; });
    }

    gameloop(now) {
        if (!this.last) this.last = now;
        const dt = Math.min((now - this.last) / 1000, 0.1);
        this.last = now;

        if (this.state === "playing" && this.player.health <= 0) {
            this.state = "lost";
        }

        if (this.state === "playing") {
            this.checkCollision();
            this.objects = this.objects.filter(o => o.active);
            for (const o of this.objects) o.update(dt);
            this.loot = this.loot.filter(l => l.active);
            this.updateChests(dt);
            this.updateRescue(dt);
        }



        vctx.fillStyle = vctx.createPattern(this.sprite, "repeat");
        vctx.fillRect(0, 0, VIEW_W, VIEW_H);

        const p = this.player.coordinate;
        const cx = Math.round(p.x);
        const cy = Math.round(p.y);

        vctx.save();
        vctx.translate(VIEW_W / 2 - cx, VIEW_H / 2 - cy);

        vctx.fillStyle = this.waterPattern;
        vctx.fillRect(cx - VIEW_W / 2, cy - VIEW_H / 2, VIEW_W, VIEW_H);

        if (DEBUG) this.drawDebugGrid();

        for (const l of this.loot) {
            if (Math.abs(l.coordinate.x - p.x) > VIEW_W / 2 + 32) continue;
            if (Math.abs(l.coordinate.y - p.y) > VIEW_H / 2 + 32) continue;
            l.draw(vctx);
        }

        if (this.rescue.target) this.rescue.target.draw(vctx);
        for (const o of this.objects) o.draw(vctx);


        vctx.restore();
        this.drawVisionBubble();
        this.drawTargetHint();
        this.ui.draw(vctx);


        if (this.state === "lost") this.drawLostMenu(vctx);

        ctx.drawImage(view, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame((t) => this.gameloop(t));
    }

    drawLostMenu(ctx) {
        ctx.fillStyle = "rgb(0 0 0 / 0.42)";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.font = "40px monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Lost", VIEW_W / 2, VIEW_H / 2);
    }

    checkCollision() {
        for (const loot of this.loot) {
            if (!loot.active) continue;

            if (loot instanceof Loot && this.player.collidesWith(loot)) {
                if (!this.player.inventory.full) {
                    if (this.player.inventory.add({ type: "chest", icon: Loot.frames[0] })) {
                        loot.active = false;
                    }
                }
                this.player.heal(Math.floor(Math.random() * 20) + 10);
            } else if (loot instanceof Wood && this.player.collidesWith(loot)) {
                this.player.fuel(15);
                loot.active = false;
            }
        }
    }

    drawVisionBubble() {
        const cx = VIEW_W / 2;
        const cy = VIEW_H / 2;
        const light = this.player.lightLevel;
        const base = this.player.baseRadius;
        const min = 80;

        // shrink bubble based on % gas when gas% < 20
        let radius = base;
        if (this.player.gas < 20) {
            const t = this.player.gas / 20;
            radius = min + (base - min) * t * t;
        }

        // shrink buble to 55% if lantern si off
        const r = radius * (0.55 + 0.45 * light);
        this.player.visibleRadius = r;

        // dark outside the bubble
        const outer = (DEBUG ? 0.5 : 0.8) + 0.17 * (1 - light);
        vctx.save();
        vctx.fillStyle = `rgba(0, 0, 0, ${outer})`;
        vctx.beginPath();
        vctx.rect(0, 0, VIEW_W, VIEW_H);
        vctx.arc(cx, cy, r, 0, Math.PI * 2);
        vctx.fill("evenodd");
        vctx.restore();

        // inside bubble, dimmed if lantenr is off
        vctx.save();
        vctx.fillStyle = `rgba(0, 0, 0, ${0.5 * (1 - light)})`;
        vctx.beginPath();
        vctx.arc(cx, cy, r, 0, Math.PI * 2);
        vctx.fill();
        vctx.restore();

        // idk this is as "warm feeling" I could get
        if (light > 0.01) {
            const g = vctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, `rgba(255, 190, 80, ${0.30 * light})`);
            g.addColorStop(1, "rgba(255, 190, 80, 0)");
            vctx.save();
            vctx.fillStyle = g;
            vctx.beginPath();
            vctx.arc(cx, cy, r, 0, Math.PI * 2);
            vctx.fill();
            vctx.restore();
        }
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
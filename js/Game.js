import { WORLD_SIZE, VIEW_W, VIEW_H, DEBUG, GENERALS, RESCUE, CHESTS } from "./config.js";
import { canvas, ctx, view, vctx } from "./canvas.js";
import { state, mouse } from "./state.js";
import { ITEMS } from "./items.js";
import { Coordinate } from "./Coordinate.js";
import { Player } from "./Player.js";
import { Enemy } from "./Enemy.js";
import { General } from "./General.js";
import { Loot } from "./Loot.js";
import { Wood } from "./Wood.js";
import { UI } from "./ui/UI.js";
import { Bar } from "./ui/Bar.js";
import { Label } from "./ui/Label.js";
import { Hotbar } from "./ui/Hotbar.js";
import { ChestPanel } from "./ui/ChestPanel.js";
import { Compass } from "./ui/Compass.js";
import { Icon } from "./ui/Icon.js";
import { FrenchShip } from "./FrenchShip.js";
import { unlockAudio, updateAudio } from "./audio.js";
import { Intro } from "./Intro.js";

const flameOn = Object.assign(new Image(), { src: "assets/ui/flame-on.png" });
const flameOff = Object.assign(new Image(), { src: "assets/ui/flame-off.png" });
const silhouette = Object.assign(new Image(), { src: "assets/ui/GeneralSilhuett.png" });
const generalPortraits = GENERALS.map((g) =>
    Object.assign(new Image(), { src: `assets/generals/${g.sprite}.png` }),
);

export class Game {
    constructor() {
        this.player = new Player({
            coordinate: new Coordinate(0, 0),
            width: 64,
            height: 64,
            acceleration: 60,
            minSpeed: -50,
            maxSpeed: 120,
        });
        this.objects = [
            this.player,
            new Enemy({
                coordinate: new Coordinate(200, 800),
                width: 64,
                height: 64,
                target: this.player,
                maxSpeed: 120,
                acceleration: 60,
            }),
        ];
        this.state = "intro"; // intro || playing || lost || won
        this.intro = new Intro();
        this.loot = [];
        this.sprite = Object.assign(new Image(), { src: "assets/sea/sea.png" });

        this.sprite.onload = () => {
            this.waterPattern = vctx.createPattern(this.sprite, "repeat");
        };
        this.waterPattern = "#2a6fb0";

        this.fogSprite = new Image();
        this.fogSprite.src = "assets/fog/standard-fog.png";
        this.fogSprite.onload = () => {
            this.fogPattern = vctx.createPattern(this.fogSprite, "repeat");
        };
        this.fogPattern = "#4e4a4e"; // fallback until the png loads
        this.huntGlow = 0;

        this.spawnLoot(500);

        this.chestTimer = 0;
        this.openedChest = null;
        this.regens = [];

        this.nearChest = null;
        this.nearGeneral = false;
        this.drag = null; // obj iwht list and index
        for (let i = 0; i < CHESTS.maxPerArea; i++) this.spawnChest();

        this.rescue = {
            phase: "generals", // generals || french
            index: 0,
            target: null, // current general in the water
            french: null, // the french ship, spawns when phase is french
            timeLeft: 0,
            age: 0, // seconds since target general spawned
            arcOffset: 0, // idk broski trello says "general direction"
        };

        this.spawnGeneral();

        this.hotbar = new Hotbar({
            anchor: "bottomcenter",
            y: 8,
            getInventory: () => this.player.inventory,
            getDrag: () => this.drag,
        });
        this.chestPanel = new ChestPanel({
            anchor: "bottomcenter",
            y: 38,
            getChest: () => this.openedChest,
            getDrag: () => this.drag,
            getHover: () => this.slotAt(mouse.x, mouse.y),
        });

        this.ui = new UI()
            .add(
                new Bar({
                    anchor: "topright",
                    x: 8,
                    y: 8,
                    width: 96,
                    height: 30,
                    background: Object.assign(new Image(), {
                        src: "assets/ui/dry-wood.png",
                    }),
                    inset: { left: 9, top: 6, right: 6, bottom: 9 },
                    getValue: () => this.player.health,
                    color: "#078723",
                    max: 100,
                }),
            )
            .add(
                new Label({
                    anchor: "topright",
                    x: 8,
                    y: 80,
                    width: 100,
                    getText: () =>
                        `H${Math.floor(this.player.health)}, G${Math.floor(this.player.gas)}`,
                    debugOnly: true,
                }),
            )
            .add(
                new Label({
                    anchor: "topright",
                    x: 8,
                    y: 104,
                    width: 100,
                    getText: () =>
                        `${Math.round(this.player.coordinate.x)}, ${Math.round(this.player.coordinate.y)}`,
                    debugOnly: true,
                }),
            )
            .add(
                new Icon({
                    anchor: "topleft",
                    x: 8,
                    y: 5,
                    width: 16,
                    height: 16,
                    getImage: () => (this.player.lanternOn ? flameOn : flameOff),
                }),
            )
            .add(
                new Bar({
                    anchor: "topleft",
                    x: 28,
                    y: 8,
                    width: 130,
                    height: 10,
                    getValue: () => this.player.gas,
                    color: "#E37C07",
                    max: 100,
                }),
            )
            .add(
                new Compass({
                    anchor: "bottomright",
                    x: 8,
                    y: 8,
                    width: 64,
                    height: 64,
                    isVisible: () => this.rescue.index >= RESCUE.compassAfter,
                    getAngle: () => this.frenchShipAngle(),
                }),
            )
            .add(this.hotbar)
            .add(this.chestPanel);

        GENERALS.forEach((_, i) => {
            this.ui.add(
                new Icon({
                    anchor: "topright",
                    x: 8 + (GENERALS.length - 1 - i) * 32,
                    y: 40,
                    width: 32,
                    height: 32,
                    getImage: () => (this.rescue.index > i ? generalPortraits[i] : silhouette),
                }),
            );
        });
        this.last = 0;
    }

    get hunted() {
        return this.objects.some((e) => e instanceof Enemy && e.active && e.state === "hunting");
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
            this.loot.push(
                new Wood({
                    coordinate: new Coordinate(x, y),
                    width: 16,
                    height: 16,
                }),
            );
        }
    }

    updateChests(dt) {
        let count = 0;

        for (const loot of this.loot) {
            if (!(loot instanceof Loot) || !loot.active) continue;
            if (
                Math.abs(loot.coordinate.x - this.player.coordinate.x) > CHESTS.areaSize / 2 ||
                Math.abs(loot.coordinate.y - this.player.coordinate.y) > CHESTS.areaSize / 2
            ) {
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

    updateHunted(dt) {
        const target = this.hunted ? 1 : 0;
        this.huntGlow += (target - this.huntGlow) * Math.min(1, 6 * dt);
    }

    spawnChest() {
        for (let i = 0; i < 20; i++) {
            const x = this.player.coordinate.x + (Math.random() * 2 - 1) * (CHESTS.areaSize / 2);
            const y = this.player.coordinate.y + (Math.random() * 2 - 1) * (CHESTS.areaSize / 2);
            if (
                Math.hypot(x - this.player.coordinate.x, y - this.player.coordinate.y) <
                this.player.baseRadius + CHESTS.safeMargin
            )
                continue;
            const chest = new Loot({
                coordinate: new Coordinate(x, y),
                width: 16,
                height: 16,
            });
            chest.slots = this.rollChestSlots();
            this.loot.push(chest);
            return true;
        }
        return false;
    }

    rollChestSlots() {
        return Array.from({ length: Math.random() < CHESTS.twoSlotChance ? 2 : 1 }, () => {
            const ids = Object.keys(ITEMS);
            const total = ids.reduce((sum, id) => sum + ITEMS[id].weight, 0);
            let roll = Math.random() * total;
            for (const id of ids) {
                roll -= ITEMS[id].weight;
                if (roll < 0) return id;
            }
        });
    }

    chestInRange(chest, range) {
        return (
            Math.hypot(
                chest.coordinate.x - this.player.coordinate.x,
                chest.coordinate.y - this.player.coordinate.y,
            ) <= range
        );
    }

    randomCoordinateFromCoordinate(coordinate, minDist, maxDist) {
        const limit = WORLD_SIZE / 2 - 100; // Limits coordinate from world border by 100 px
        let x, y;

        // player cant leave the world so this always finds a coord
        for (;;) {
            const angle = Math.random() * Math.PI * 2;
            const distance = minDist + Math.random() * (maxDist - minDist);
            x = coordinate.x + Math.cos(angle) * distance;
            y = coordinate.y + Math.sin(angle) * distance;

            if (Math.abs(x) <= limit && Math.abs(y) <= limit) return new Coordinate(x, y);
        }
    }

    spawnGeneral() {
        const pos = this.randomCoordinateFromCoordinate(
            this.player.coordinate,
            RESCUE.minDist,
            RESCUE.maxDist,
        );
        const dist = Math.hypot(pos.x - this.player.coordinate.x, pos.y - this.player.coordinate.y);

        this.rescue.target = new General({
            coordinate: pos,
            width: 32,
            height: 32,
            name: GENERALS[this.rescue.index].name,
            sprite: GENERALS[this.rescue.index].sprite,
        });

        this.rescue.timeLeft = dist / this.player.maxSpeed + RESCUE.bufferTime;
        this.rescue.age = 0;

        this.rescue.arcOffset = 0; // TODO: add a bit of randomness
    }

    spawnFrenchShip() {
        this.rescue.french = new FrenchShip({
            coordinate: this.randomCoordinateFromCoordinate(
                this.player.coordinate,
                RESCUE.frenchMin,
                RESCUE.frenchMax,
            ),
            width: 96,
            height: 192,
        });
    }

    frenchShipAngle() {
        const f = this.rescue.french;
        if (!f) return 0;
        const p = this.player.coordinate;
        return Math.atan2(f.coordinate.y - p.y, f.coordinate.x - p.x) + Math.PI / 2;
    }

    updateRescue(dt) {
        if (this.rescue.phase === "french") {
            const f = this.rescue.french.coordinate;
            const p = this.player.coordinate;
            if (Math.hypot(f.x - p.x, f.y - p.y) <= RESCUE.frenchRange) this.state = "won";
            return;
        }
        if (this.rescue.phase !== "generals") return;

        this.rescue.age += dt;
        this.rescue.timeLeft -= dt;
        if (this.rescue.timeLeft <= 0) this.state = "lost";

        this.rescue.target.update(dt, this.rescue.timeLeft);
        const t = this.rescue.target.coordinate;
        const p = this.player.coordinate;
        this.nearGeneral = Math.hypot(t.x - p.x, t.y - p.y) <= RESCUE.pickupRange;
    }

    rescueGeneral() {
        this.rescue.target.voice.stop();
        this.rescue.index++;
        this.nearGeneral = false;

        if (this.rescue.index < GENERALS.length) {
            this.spawnGeneral();
        } else {
            this.rescue.phase = "french";
            this.rescue.target = null;
            this.spawnFrenchShip();
        }
    }

    // TODO: fix close-spawns so this isnt needed
    interact() {
        if (this.nearGeneral) this.rescueGeneral();
        else this.toggleChest();
    }

    drawTargetHint() {
        if (this.rescue.phase !== "generals" || !this.rescue.target) return;

        if (this.rescue.age % (2 * RESCUE.hintVisibilitySeconds) >= RESCUE.hintVisibilitySeconds)
            return;

        const p = this.player.coordinate;
        const t = this.rescue.target.coordinate;
        const angle = Math.atan2(t.y - p.y, t.x - p.x) + this.rescue.arcOffset;

        vctx.save();
        vctx.strokeStyle = "#ffd866";
        vctx.lineWidth = 3;
        vctx.beginPath();
        vctx.arc(
            VIEW_W / 2,
            VIEW_H / 2,
            this.player.visibleRadius + 12,
            angle - Math.PI / 3,
            angle + Math.PI / 3,
        );
        vctx.stroke();
        vctx.restore();
    }

    // red border that pulses when the enemy sees you
    drawHuntedEdge() {
        if (this.huntGlow < 0.01 || this.state !== "playing") return;

        const time = performance.now() / 1000;
        const alpha = this.huntGlow * (0.45 + 0.15 * Math.sin(time * 10));

        // 4px wide rings, fading out towards the middle
        vctx.save();
        vctx.lineWidth = 4;
        for (let i = 0; i < 28; i += 4) {
            vctx.strokeStyle = `rgba(255, 30, 30, ${alpha * (1 - i / 28)})`;
            vctx.strokeRect(i + 2, i + 2, VIEW_W - i * 2 - 4, VIEW_H - i * 2 - 4);
        }
        vctx.restore();
    }

    initListeners() {
        document.addEventListener("keydown", (e) => {
            unlockAudio();
            state[e.code] = true;
            if (this.state === "intro") {
                if (!e.repeat) this.advanceIntro();
                return;
            }
            if (e.repeat || this.state !== "playing") return;

            if (e.code === "KeyE") this.interact();
            else if (e.code === "Escape") this.closeChest();
            else if (e.code === "Space") {
                e.preventDefault();
                this.useSelectedItem();
            } else if (e.code.startsWith("Digit")) this.quickSwap(Number(e.code.slice(5)) - 1);
        });
        document.addEventListener("keyup", (e) => {
            state[e.code] = false;
        });

        window.addEventListener("mousemove", (e) => this.updateMouse(e));
        canvas.addEventListener("mousedown", (e) => {
            unlockAudio();
            this.updateMouse(e);
            if (this.state === "intro") this.advanceIntro();
            else if (e.button === 0) this.startDrag();
        });
        window.addEventListener("mouseup", (e) => {
            this.updateMouse(e);
            if (e.button === 0) this.endDrag();
        });
    }

    advanceIntro() {
        if (this.intro.advance()) this.state = "playing";
    }

    // Convert mouse pos to view pos
    updateMouse(e) {
        const r = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) * VIEW_W) / canvas.clientWidth;
        mouse.y = ((e.clientY - r.top) * VIEW_H) / canvas.clientHeight;
    }

    // which list & index is slot in (chest/hotbar)
    slotAt(x, y) {
        if (!this.openedChest) return null;
        const isInside = (rect) =>
            x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;

        const chestIndex = this.chestPanel.slotRects(this.openedChest).findIndex(isInside);
        if (chestIndex !== -1) return { list: this.openedChest.slots, index: chestIndex };

        const slots = this.player.inventory.slots;
        const hotbarIndex = slots.findIndex((_, i) => isInside(this.hotbar.slotRect(i)));
        if (hotbarIndex !== -1) return { list: slots, index: hotbarIndex };

        return null;
    }

    useSelectedItem() {
        const inv = this.player.inventory;
        if (inv.selected === null) return;
        const id = inv.slots[inv.selected];
        if (!id) return;

        const item = ITEMS[id];
        if (item.heal) this.player.heal(item.heal);
        if (item.fuel) this.player.fuel(item.fuel);
        if (item.regen) {
            this.regens.push({
                perSecond: item.regen.total / item.regen.seconds,
                timeLeft: item.regen.seconds,
            });
        }

        inv.remove(inv.selected);
    }

    // heal over time, currently onlt wine
    updateRegens(dt) {
        for (const r of this.regens) {
            this.player.heal(r.perSecond * Math.min(dt, r.timeLeft));
            r.timeLeft -= dt;
        }
        this.regens = this.regens.filter((r) => r.timeLeft > 0);
    }

    swapSlots(a, b) {
        const temp = a.list[a.index];
        a.list[a.index] = b.list[b.index];
        b.list[b.index] = temp;
    }

    toggleChest() {
        if (this.openedChest) this.closeChest();
        else if (this.nearChest) this.openedChest = this.nearChest;
    }

    closeChest() {
        if (!this.openedChest) return;
        if (this.openedChest.slots.every((s) => s === null)) this.openedChest.active = false;
        this.openedChest = null;
        this.drag = null;
    }

    // minecraft swap mechanic
    quickSwap(i) {
        const slots = this.player.inventory.slots;
        if (!this.openedChest || i < 0 || i >= slots.length) return;
        const hover = this.slotAt(mouse.x, mouse.y);
        if (!hover || hover.list !== this.openedChest.slots) return;
        this.swapSlots(hover, { list: slots, index: i });
    }

    startDrag() {
        if (this.state !== "playing") return;
        const s = this.slotAt(mouse.x, mouse.y);
        if (s && s.list[s.index]) this.drag = s;
    }

    endDrag() {
        if (!this.drag) return;
        const target = this.slotAt(mouse.x, mouse.y);
        if (target) this.swapSlots(this.drag, target);
        this.drag = null;
    }

    updateChestProximity() {
        this.nearChest = null;
        let best = CHESTS.openRange;
        for (const l of this.loot) {
            if (!(l instanceof Loot) || !l.active) continue;
            const d = Math.hypot(
                l.coordinate.x - this.player.coordinate.x,
                l.coordinate.y - this.player.coordinate.y,
            );
            if (d <= best) {
                best = d;
                this.nearChest = l;
            }
        }

        const open = this.openedChest;
        if (open && (!open.active || !this.chestInRange(open, CHESTS.openRange))) this.closeChest();
    }

    // e key above general or chest, general first
    drawPrompt() {
        if (this.state !== "playing") return;

        if (this.nearGeneral) {
            this.drawKeyPrompt(this.rescue.target.coordinate);
        } else if (this.nearChest && this.nearChest !== this.openedChest) {
            this.drawKeyPrompt(this.nearChest.coordinate);
        }
    }

    drawKeyPrompt(coordinate) {
        const p = this.player.coordinate;
        const x = Math.round(coordinate.x - p.x + VIEW_W / 2) - 5;
        const y = Math.round(coordinate.y - p.y + VIEW_H / 2) - 30;

        vctx.save();
        vctx.fillStyle = "#000";
        vctx.fillRect(x - 1, y - 1, 12, 12);
        vctx.fillStyle = "#fff";
        vctx.fillRect(x, y, 10, 10);
        vctx.fillStyle = "#000";
        vctx.font = "12px monospace";
        vctx.textAlign = "center";
        vctx.textBaseline = "middle";
        vctx.fillText("E", x + 5, y + 6);
        vctx.restore();
    }

    drawDraggedItem() {
        if (!this.drag) return;
        const id = this.drag.list[this.drag.index];
        if (!id) return;
        vctx.drawImage(ITEMS[id].icon, Math.round(mouse.x) - 8, Math.round(mouse.y) - 8);
    }

    gameloop(now) {
        if (!this.last) this.last = now;
        const dt = Math.min((now - this.last) / 1000, 0.1);
        this.last = now;

        if (this.state === "intro") {
            this.intro.update(dt);
            this.intro.draw(vctx);
            ctx.drawImage(view, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame((t) => this.gameloop(t));
            return;
        }

        if (this.state === "playing" && this.player.health <= 0) {
            this.state = "lost";
        }

        if (this.state === "playing") {
            this.checkCollision();
            this.objects = this.objects.filter((o) => o.active);
            for (const o of this.objects) o.update(dt);
            this.loot = this.loot.filter((l) => l.active);
            this.updateChests(dt);
            this.updateHunted(dt);
            this.updateRescue(dt);
            this.updateChestProximity();
            this.updateRegens(dt);
        }
        updateAudio(this.player.coordinate);

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
        if (this.rescue.french) this.rescue.french.draw(vctx);
        for (const o of this.objects) o.draw(vctx);

        vctx.restore();
        this.drawVisionBubble();
        this.drawHuntedEdge();
        this.drawTargetHint();
        this.drawPrompt();
        this.ui.draw(vctx);
        this.drawDraggedItem();

        if (this.state === "lost") this.drawEndMenu(vctx, "Lost");
        if (this.state === "won") this.drawEndMenu(vctx, "Won");

        ctx.drawImage(view, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame((t) => this.gameloop(t));
    }

    drawEndMenu(ctx, text) {
        ctx.fillStyle = "rgb(0 0 0 / 0.42)";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.font = "40px monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(text, VIEW_W / 2, VIEW_H / 2);
    }

    checkCollision() {
        for (const loot of this.loot) {
            if (!loot.active) continue;

            if (loot instanceof Wood && this.player.collidesWith(loot)) {
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

        // fog outside the bubble, anchored to the world so it scrolls with the sea
        const p = this.player.coordinate;
        const px = Math.round(p.x);
        const py = Math.round(p.y);
        vctx.save();
        vctx.beginPath();
        vctx.rect(0, 0, VIEW_W, VIEW_H);
        vctx.arc(cx, cy, r, 0, Math.PI * 2);
        vctx.clip("evenodd");

        if (DEBUG) vctx.globalAlpha = 0.5; // see through the fog when debugging
        vctx.save();
        vctx.translate(cx - px, cy - py);
        vctx.fillStyle = this.fogPattern;
        vctx.fillRect(px - cx, py - cy, VIEW_W, VIEW_H);
        vctx.restore();

        // fog gets darker when the lantern is off
        vctx.fillStyle = `rgba(0, 0, 0, ${0.6 * (1 - light)})`;
        vctx.fillRect(0, 0, VIEW_W, VIEW_H);
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
            g.addColorStop(0, `rgba(255, 190, 80, ${0.3 * light})`);
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

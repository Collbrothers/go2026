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
        this.ui = new UI()
            .add(
                new Bar({
                    anchor: "topright",
                    x: 8,
                    y: 8,
                    width: 100,
                    height: 8,
                    getValue: () => this.player.health,
                    max: 100
                })
            )
            .add(
                new Label({
                    anchor: "topright",
                    x: 8,
                    y: 32,
                    width: 100,
                    getText: () => `${Math.round(this.player.coordinate.x)}, ${Math.round(this.player.coordinate.y)}`,
                    debugOnly: true
                })
            )
        this.last = 0;
    }

    start() {
        this.initListeners();
        requestAnimationFrame((t) => this.gameloop(t));
    }

    initListeners() {
        document.addEventListener("keydown", (e) => { state[e.code] = true; });
        document.addEventListener("keyup", (e) => { state[e.code] = false; });
    }

    gameloop(now) {
        if (!this.last) this.last = now;
        const dt = Math.min((now - this.last) / 1000, 0.1);
        this.last = now;

        for (const obj of this.objects) obj.update(dt);

        vctx.fillStyle = "#2a6fb0";
        vctx.fillRect(0, 0, VIEW_W, VIEW_H);

        vctx.save();
        vctx.translate(
            VIEW_W / 2 - Math.round(this.player.coordinate.x),
            VIEW_H / 2 - Math.round(this.player.coordinate.y)
        );
        if (DEBUG) this.drawDebugGrid();
        for (const o of this.objects) o.draw(vctx);
        vctx.restore();
        this.drawVisionBubble();
        this.ui.draw()
        ctx.drawImage(view, 0, 0, canvas.width, canvas.height);

        ctx.drawImage(view, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame((t) => this.gameloop(t));
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

        // Yellow/brown ish tint inside the bubble
        const g = vctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(255, 190, 80, 0.30)");
        g.addColorStop(1, "rgba(255, 190, 80, 0)");

        vctx.save();
        vctx.fillStyle = g;
        vctx.beginPath();
        vctx.arc(cx, cy, r, 0, Math.PI * 2);
        vctx.fill();
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
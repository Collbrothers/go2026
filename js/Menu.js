import { VIEW_W, VIEW_H, CREDITS } from "./config.js";

const playImg = Object.assign(new Image(), { src: "assets/ui/play-button.png" });
const creditsImg = Object.assign(new Image(), { src: "assets/ui/credits-button.png" });
const titleImg = Object.assign(new Image(), { src: "assets/ui/screentitle.png" });

const textColor = "rgb(232, 224, 208)";
const greyColor = "rgb(160, 160, 160)";

export class Menu {
    constructor() {
        this.showCredits = false;

        const w = 128;
        const h = 32;
        const x = (VIEW_W - w) / 2;
        const y = VIEW_H / 2 - h - 6;

        this.play = { img: playImg, x: x, y: y, w: w, h: h };
        this.credits = { img: creditsImg, x: x, y: y + h + 12, w: w, h: h };
    }

    isOver(button, x, y) {
        return x >= button.x && x < button.x + button.w && y >= button.y && y < button.y + button.h;
    }

    click(x, y) {
        if (this.showCredits) {
            this.showCredits = false;
            return false;
        }
        if (this.isOver(this.credits, x, y)) this.showCredits = true;
        return this.isOver(this.play, x, y);
    }

    // true if play, false if scredits
    key(code) {
        const confirm = code === "Enter" || code === "Space";

        if (this.showCredits) {
            if (confirm || code === "Escape") this.showCredits = false;
            return false;
        }
        if (code === "KeyC") this.showCredits = true;
        return confirm;
    }

    draw(ctx, mouse) {
        ctx.save();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        if (this.showCredits) this.drawCredits(ctx);
        else this.drawButtons(ctx, mouse);

        ctx.restore();
    }

    drawButtons(ctx, mouse) {
        ctx.drawImage(titleImg, (VIEW_W - 256) / 2, 48);

        for (const b of [this.play, this.credits]) {
            // brighted and moves up
            const hover = this.isOver(b, mouse.x, mouse.y);
            ctx.globalAlpha = hover ? 1 : 0.85;
            ctx.drawImage(b.img, b.x, hover ? b.y - 1 : b.y);
        }
    }

    drawCredits(ctx) {
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        ctx.font = "20px monospace";
        ctx.fillStyle = textColor;
        ctx.fillText("Credits", VIEW_W / 2, 24);

        const rows = Math.ceil(CREDITS.length / 2);
        const rowHeight = 32;
        const top = 64;

        for (let i = 0; i < CREDITS.length; i++) {
            const person = CREDITS[i];
            const column = i < rows ? 0 : 1;
            const x = column === 0 ? VIEW_W / 4 : (VIEW_W * 3) / 4;
            const y = top + (i % rows) * rowHeight;

            ctx.font = "12px monospace";
            ctx.fillStyle = textColor;
            ctx.fillText(person.name, x, y);

            ctx.font = "9px monospace";
            ctx.fillStyle = greyColor;
            ctx.fillText(person.role, x, y + 14);
        }

        ctx.fillText("Click or press Escape to go back", VIEW_W / 2, VIEW_H - 24);
    }
}

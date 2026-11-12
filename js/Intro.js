import { VIEW_W, VIEW_H, INTRO } from "./config.js";

const INTRO_TEXT = [
    "October 21, 1805. Battle of Trafalgar",
    "The Franco-Spanish fleet is burning. The day is lost, but the battle is not over. It drags on into the night.",
    "You were a captain. When the masts fell and your ship began to sink, you took a life boat and rowed away. Six hundred men were left behind.",
    "Now the fleet’s three generals drift in the water: Villeneuve, Lucas and Dumanoir le Pelly. They fell overboard when the ships broke apart. Without them, the fleet has no command.",
    "The British hunt everything that floats. Every light they see in the darkness is pray.",
    "You must get away from here, but not alone. The last general holds a compass, and it points to a second fleet waiting beyond the fog.",
    "Find them before they sink. Keep your lantern lit, but put it out when the British draw near.",
    "You abandoned your crew once. Don’t abandon them too.",
];

function holdTime(text) {
    const words = text.trim().split(/\s+/).length;
    const seconds = (words / INTRO.wpm) * 60;
    return Math.max(INTRO.minHold, seconds);
}

// splits text into lines that fit inside maxWidth
function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (const word of words) {
        const attempt = current === "" ? word : current + " " + word;
        if (current !== "" && ctx.measureText(attempt).width > maxWidth) {
            lines.push(current);
            current = word;
        } else {
            current = attempt;
        }
    }
    if (current !== "") lines.push(current);

    return lines;
}

export class Intro {
    constructor(paragraphs = INTRO_TEXT) {
        this.paragraphs = paragraphs;
        this.time = 0;

        this.showTimes = [];
        let t = INTRO.startDelay;
        for (const text of paragraphs) {
            this.showTimes.push(t);
            t += holdTime(text);
        }
        this.endTime = t;

        this.lines = null;
        this.font = null;
        this.fontSize = 0;
    }

    update(dt) {
        this.time += dt;
    }

    // skip to next paragraph, returns true when no paragraphs are left
    advance() {
        if (this.time >= this.endTime) return true;

        let next = this.endTime;
        for (const t of this.showTimes) {
            if (t > this.time) {
                next = t;
                break;
            }
        }
        this.time = next;
        return false;
    }

    // wraps all paragraphs and use the biggest font size possible
    layout(ctx) {
        const avaibleHeight = VIEW_H - INTRO.margin * 2 - INTRO.promptSpace;
        const smallest = 6;

        for (let size = INTRO.fontSize; size >= smallest; size--) {
            ctx.font = `${size}px monospace`;
            const lineHeight = Math.round(size * 1.4);
            const paragraphGap = Math.round(size * 0.9);

            const lines = [];
            let y = 0;
            for (let i = 0; i < this.paragraphs.length; i++) {
                const wrapped = wrapText(ctx, this.paragraphs[i], INTRO.maxWidth);
                for (const text of wrapped) {
                    lines.push({ text: text, paragraph: i, y: y });
                    y += lineHeight;
                }
                y += paragraphGap;
            }
            const totalHeight = y - paragraphGap;

            if (totalHeight <= avaibleHeight || size === smallest) {
                const top = INTRO.margin + Math.round((avaibleHeight - totalHeight) / 2);
                for (const line of lines) {
                    line.y += top;
                }
                this.lines = lines;
                this.font = ctx.font;
                this.fontSize = size;
                return;
            }
        }
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        if (this.lines === null) this.layout(ctx);

        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        ctx.fillStyle = "rgb(232, 224, 208)";
        for (const line of this.lines) {
            if (this.time < this.showTimes[line.paragraph]) continue;
            ctx.fillText(line.text, VIEW_W / 2, line.y);
        }

        // press any key prompt at the end
        if (this.time >= this.endTime) {
            ctx.fillStyle = "rgb(160, 160, 160)";
            ctx.fillText(
                "Press any key to begin",
                VIEW_W / 2,
                VIEW_H - INTRO.margin - this.fontSize,
            );
        }

        ctx.restore();
    }
}

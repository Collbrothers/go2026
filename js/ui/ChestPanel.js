import { UIElement } from "./UIElement.js";
import { ITEMS } from "../items.js";

const panelImage = (src) => Object.assign(new Image(), { src: `assets/inventory/${src}` });

// Layout of chest inventory, pixel pos might not be perfect, best I could do
const LAYOUTS = {
    1: {
        image: panelImage("chest-1-slot.png"),
        slots: [{ x: 24, y: 39 }],
    },
    2: {
        image: panelImage("chest-2-slots.png"),
        slots: [
            { x: 12, y: 39 },
            { x: 36, y: 39 },
        ],
    },
};
const SLOT_W = 16;
const SLOT_H = 18;

export class ChestPanel extends UIElement {
    constructor(opts) {
        super({ ...opts, width: 64, height: 64 });
        this.getChest = opts.getChest;
        this.getDrag = opts.getDrag;
        this.getHover = opts.getHover;
    }

    slotRects(chest) {
        const { x, y } = this.pos;
        return LAYOUTS[chest.slots.length].slots.map((s) => ({
            x: x + s.x,
            y: y + s.y,
            w: SLOT_W,
            h: SLOT_H,
        }));
    }

    draw(ctx) {
        const chest = this.getChest();
        if (!chest) return;

        const { x, y } = this.pos;
        ctx.drawImage(LAYOUTS[chest.slots.length].image, x, y);

        const drag = this.getDrag();
        const hover = this.getHover();

        this.slotRects(chest).forEach((r, i) => {
            if (hover && hover.list === chest.slots && hover.index === i) {
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 1;
                ctx.strokeRect(r.x - 0.5, r.y - 0.5, r.w + 1, r.h + 1);
            }

            const id = chest.slots[i];
            if (!id || (drag && drag.list === chest.slots && drag.index === i)) return;
            ctx.drawImage(ITEMS[id].icon, r.x, r.y + 1);
        });
    }
}

import { UIElement } from "./UIElement.js";
import { ITEMS } from "../items.js";

export class Hotbar extends UIElement {
    constructor(opts) {
        const size = 24,
            gap = 2,
            n = opts.getInventory().slots.length;
        super({ ...opts, width: n * size + (n - 1) * gap, height: size });
        this.getInventory = opts.getInventory;
        this.getDrag = opts.getDrag;
        this.inventorySlotSprite = Object.assign(new Image(), {
            src: "assets/hotbar/inventory-slot.png",
        });
        this.highlightedSlot = Object.assign(new Image(), {
            src: "assets/hotbar/inventory-highlighted.png",
        });
        this.size = size;
        this.gap = gap;
    }

    // hitbox on screen for specific slot
    slotRect(i) {
        const { x, y } = this.pos;
        const sx = x + i * (this.size + this.gap);
        return { x: sx - 1, y: y - 1, w: 24, h: 24 };
    }

    draw(ctx) {
        const inv = this.getInventory();
        const drag = this.getDrag();
        const { x, y } = this.pos;

        inv.slots.forEach((item, i) => {
            // Individual x pos for the slot
            const sx = x + i * (this.size + this.gap);

            ctx.drawImage(this.inventorySlotSprite, sx - 1, y - 1, 24, 24);

            const dragged = drag && drag.list === inv.slots && drag.index === i;
            if (item && !dragged) ctx.drawImage(ITEMS[item].icon, sx + 4, y + 4, 16, 16);

            if (i === inv.selected) {
                ctx.drawImage(this.highlightedSlot, sx - 0.5, y - 0.5, 24, 24);
            }
        });
    }
}

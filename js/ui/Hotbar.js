class Hotbar extends UIElement {
    constructor(opts) {
        const size = 24, gap = 2, n = opts.getInventory().slots.length;
        super({ ...opts, width: n * size + (n - 1) * gap, height: size });
        this.getInventory = opts.getInventory;
        this.inventorySlotSprite = new Image();
        this.highlightedSlot = new Image();
        this.inventorySlotSprite.src = "inventory-slot.png";
        this.highlightedSlot.src = "inventory-highlighted.png";
        this.size = size;
        this.gap = gap;
    }

    draw(ctx) {
        const inv = this.getInventory();
        const { x, y } = this.pos;

        inv.slots.forEach((item, i) => {
            // Individual x pos for the slot
            const sx = x + i * (this.size + this.gap);


            ctx.drawImage(this.inventorySlotSprite, sx - 1, y - 1, 24, 24)

            if (item) ctx.drawImage(item.icon, sx + 4, y + 4, 16, 16);

            if (i === inv.selected) {
                ctx.drawImage(this.highlightedSlot, sx - 0.5, y - 0.5, 24, 24);
            }
        });
    }
}
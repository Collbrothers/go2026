export class Inventory {
    constructor(size = 3) {
        this.slots = new Array(size).fill(null);
        this.selected = null;
        this.size = size;
    }

    get full() {
        return !this.slots.includes(null);
    }
    get current() {
        return this.slots[this.selected];
    } // for future usage

    add(item) {
        const i = this.slots.indexOf(null);
        if (i === -1) return false;
        this.slots[i] = item;
        return true;
    }

    remove(i) {
        const item = this.slots[i];
        this.slots[i] = null;
        return item;
    }

    select(i) {
        if (i >= 0 && i < this.slots.length) this.selected = i;
    }
}

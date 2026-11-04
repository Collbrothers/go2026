    class Inventory {
    constructor(maxItems) {
        this.items = [];
        this.maxItems = maxItems;
    }

        /**
         * Add an item (loot) to the inventory
         * @param item Which item to add
         * @param index Which inventory slot out of Inventory#maxItems will the item be in
         * @returns {void}
         */
    add(item, index) {
        this.items[index] = item;
    }

    remove(index) {
        this.items[index] = null;
    }
}
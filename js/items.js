function itemIcon(src) {
    return Object.assign(new Image(), { src: `assets/items/${src}` });
}

export const ITEMS = {
    dry: {
        name: "Dry Wood",
        weight: 40,
        fuel: 100 / 3,
        icon: itemIcon("dry-wood.png"),
        stat: "+6.7s",
    },
    wet: {
        name: "Wet Wood",
        weight: 20,
        fuel: -20,
        icon: itemIcon("wet-wood.png"),
        stat: "-4s",
    },
    croissant: {
        name: "Croissant",
        weight: 13,
        heal: 15,
        icon: itemIcon("croissant.png"),
        stat: "+15HP",
    },
    dried_meat: {
        name: "Dried meat",
        weight: 11,
        heal: 20,
        icon: itemIcon("dried-meat.png"),
        stat: "+20HP",
    },
    baguette: {
        name: "Baguette",
        weight: 9,
        heal: 25,
        icon: itemIcon("baguette.png"),
        stat: "+20HP",
    },
    wine: {
        name: "Wine",
        weight: 7,
        regen: {
            total: 45,
            seconds: 7,
        },
        icon: itemIcon("wine.png"),
        stat: "+45HP for 7s",
    },
};

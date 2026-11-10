export const VIEW_W = 640;
export const VIEW_H = 360;
export const SCALE = 2;
export const WORLD_SIZE = 4000;
export const DEBUG = false;
export const GENERALS = [
    {
        name: "Pierre-Charles Villeneuve",
    },
    {
        name: "Jean-Jacques-Étienne Lucas",
    },
    {
        name: "Pierre-Rosario-Louis-François Dumanoir le Pelley",
    },
];

export const RESCUE = {
    minDist: 250,
    maxDist: 450,
    bufferTime: 30,
    hintVisibilitySeconds: 3,
    frenchMin: 1000,
    frenchMax: 1500,
    frenchRange: 120, // how close to the french ship to win
    compassAfter: 3, // generals rescued before the compass shows up
    pickupRange: 50,
};

export const CHESTS = {
    areaSize: 1200,
    maxPerArea: 6,
    spawnInterval: 1.5,
    safeMargin: 32, // outside the light circle
    twoSlotChance: 0.5,
    openRange: 50, // how close to ppåem
};

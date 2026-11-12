export const VIEW_W = 640;
export const VIEW_H = 360;
export const SCALE = 2;
export const WORLD_SIZE = 4000;
export const DEBUG = false;
export const GENERALS = [
    {
        name: "Pierre-Charles Villeneuve",
        sprite: "Pierre.charles",
    },
    {
        name: "Jean-Jacques-Étienne Lucas",
        sprite: "Jean.Jacques.lucas",
    },
    {
        name: "Pierre-Rosario-Louis-François Dumanoir le Pelley",
        sprite: "Dumanoi.le.Pelley",
    },
];

export const RESCUE = {
    minDist: 1000,
    maxDist: 1500,
    bufferTime: 30,
    hintVisibilitySeconds: 3,
    frenchMin: 1000,
    frenchMax: 1500,
    frenchRange: 60, // how close to the french ship to win
    compassAfter: 3, // generals rescued before the compass shows up
    pickupRange: 50,
};

export const AUDIO = {
    volume: 1,
    musicVolume: 0.4, // main theme
    enemyRange: 700, // fade to silent for enemies at distance
    generalRange: 800,
    generalFirstCall: 1, // seconds before firrt general starts talking
    generalCallInterval: [5, 9], // min max seconds between callouts
    drownTime: 15, // seconds until general switches to drownign voice lines
    drownCallInterval: [3.5, 5],
    postFiringDelay: 1, // seconds after shot boat talks
    postFiringChance: 0.5,
};

export const CHESTS = {
    areaSize: 1200,
    maxPerArea: 6,
    spawnInterval: 1.5,
    safeMargin: 32, // outside the light circle
    twoSlotChance: 0.5,
    openRange: 50, // how close to ppåem
};

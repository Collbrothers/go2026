const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const view = document.createElement("canvas");
const vctx = view.getContext("2d");

const VIEW_W = 640;
const VIEW_H = 360;
const SCALE = 2;
const WORLD_SIZE = 4000;
let DEBUG = false;
const state = {};

canvas.width = VIEW_W * SCALE;
canvas.height = VIEW_H * SCALE;
view.width = VIEW_W;
view.height = VIEW_H;

ctx.imageSmoothingEnabled = false;
vctx.imageSmoothingEnabled = false;

new Game().start();
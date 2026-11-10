import { VIEW_W, VIEW_H, SCALE } from "./config.js";

export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
export const view = document.createElement("canvas");
export const vctx = view.getContext("2d");

canvas.width = VIEW_W * SCALE;
canvas.height = VIEW_H * SCALE;
view.width = VIEW_W;
view.height = VIEW_H;

ctx.imageSmoothingEnabled = false;
vctx.imageSmoothingEnabled = false;

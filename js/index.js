const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const CANVAS_HEIGHT = 720;
const CANVAS_WIDTH = 1280;
const DEBUG = true;

if(DEBUG) console.log("Starting with debug on")
new Game(CANVAS_WIDTH, CANVAS_HEIGHT).start();
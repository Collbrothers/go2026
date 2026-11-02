class Game {

    // For future impl of deltatime
    targetFps  = 60;
    last;
    frameDuration = 1000 / this.targetFps;

    constructor(width, height) {
        canvas.width = width;
        canvas.height = height;

    }

    start() {
        requestAnimationFrame((timestamp) => {
            this.gameloop(timestamp);
        });
    }

    gameloop(now) {
        requestAnimationFrame((timestamp) => {
            this.gameloop(timestamp);
        });
    }
}
import { GameObject } from "./GameObject.js";

export class Wood extends GameObject {
    constructor(opts) {
        super(opts);
        this.sprite = Object.assign(new Image(), { src: "assets/wreck/shipwreck-test.png" });
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.coordinate.x, this.coordinate.y, 64, 64);
    }
}

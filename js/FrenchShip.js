import { GameObject } from "./GameObject.js";

export class FrenchShip extends GameObject {
    static sprite = Object.assign(new Image(), { src: "assets/boat/french.png" });

    draw(ctx) {
        ctx.drawImage(
            FrenchShip.sprite,
            Math.round(this.coordinate.x - this.width / 2),
            Math.round(this.coordinate.y - this.height / 2),
            this.width,
            this.height,
        );
    }
}

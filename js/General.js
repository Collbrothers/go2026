import { GameObject } from "./GameObject.js";
import { AUDIO } from "./config.js";
import { Speaker, VOICES } from "./audio.js";

export class General extends GameObject {
    constructor(opts = {}) {
        super(opts);
        this.name = opts.name;
        this.voice = new Speaker({
            voices: VOICES.general,
            getPos: () => this.coordinate,
            range: AUDIO.generalRange,
        });
        this.callTimer = AUDIO.generalFirstCall;

        this.drowning = false;
        this.sprite = Object.assign(new Image(), { src: `assets/generals/${opts.sprite}.png` });
        this.downSprite = Object.assign(new Image(), {
            src: `assets/generals/${opts.sprite}-down.png`,
        });
    }

    update(dt, timeLeft) {
        const drowning = timeLeft <= AUDIO.drownTime;
        this.drowning = drowning;

        this.callTimer -= dt;
        if (this.callTimer > 0) return;

        this.voice.sayIfQuiet(drowning ? "near_drown" : "searching");
        const [min, max] = drowning ? AUDIO.drownCallInterval : AUDIO.generalCallInterval;
        this.callTimer = min + Math.random() * (max - min);
    }

    draw(ctx) {
        const bobAnimation = Math.round(Math.sin(performance.now() / 400 + this.coordinate.x) * 2);

        ctx.drawImage(
            this.drowning ? this.downSprite : this.sprite,
            Math.round(this.coordinate.x - this.width / 2),
            Math.round(this.coordinate.y - this.height / 2) + bobAnimation,
            this.width,
            this.height,
        );
    }
}

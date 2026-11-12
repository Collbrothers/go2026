import { AUDIO } from "./config.js";

function takes(dir, name, n) {
    const list = [];
    for (let i = 1; i <= n; i++) list.push(`assets/sound/${dir}/${name}${i}.mp3`);
    return list;
}

export const VOICES = {
    enemy: {
        player_discovered: [
            takes("en/player_discovered", "LightOnTSB", 3),
            takes("en/player_discovered", "ManTheGuns", 5),
        ],
        // these two are both in en/firing, there she is only on first shot
        firing_first: [takes("en/firing", "ThereSheIsFire", 5)],
        firing: [takes("en/firing", "Fire", 5)],
        post_firing: [
            takes("en/post_firing", "AfterHerLads", 4),
            takes("en/post_firing", "FrenchmanSYC", 3),
            takes("en/post_firing", "ReloadVA", 6),
        ],
        player_lost: [
            takes("en/player_lost", "ShesGoneDark", 5),
            takes("en/player_lost", "WhereDidSheGo", 4),
        ],
        rifle_fire:[takes("en/riflefire","ENRifle",3)],
    },
    general: {
        searching: [
            takes("fr/searching/captain_over_here", "CaptainOverHere", 4),
            takes("fr/searching/dont_abandon_me", "DontAbandonMe", 4),
            takes("fr/searching/help", "Help", 5),
            takes("fr/searching/im_here_help_me", "ImHereHM", 4),
        ],
        near_drown: [
            takes("fr/near_drown/im_drowning", "ImDrowning", 4),
            takes("fr/near_drown/someone_i_beg_you", "SomeoneIBY", 4),
        ],
    },
};

const ac = new AudioContext();
const sounds = {};
const talking = [];
const player = { x: 0, y: 0 };

// fetch, decode and add to buffer
for (const who in VOICES) {
    for (const event in VOICES[who]) {
        for (const line of VOICES[who][event]) {
            for (const path of line) {
                fetch(path)
                    .then((res) => res.arrayBuffer())
                    .then((data) => ac.decodeAudioData(data))
                    .then((buf) => (sounds[path] = buf))
                    .catch((e) => console.warn("Could not load audio", path, e));
            }
        }
    }
}

// main theme, no lock-check since itll loop
fetch("assets/sound/MainThemeV2.mp3")
    .then((res) => res.arrayBuffer())
    .then((data) => ac.decodeAudioData(data))
    .then((buf) => {
        const vol = ac.createGain();
        vol.gain.value = AUDIO.musicVolume;
        vol.connect(ac.destination);

        const src = ac.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        src.connect(vol);
        src.start();
    })
    .catch((e) => console.warn("Could not load music", e));

// wait until user has interacted with browser, to allow audio to play
export function unlockAudio() {
    if (ac.state === "suspended") ac.resume();
}

// run every frame so the volume follows the distance
export function updateAudio(p) {
    player.x = p.x;
    player.y = p.y;
    for (const s of talking) s.setVolume();
}

export class Speaker {
    constructor(opts) {
        this.voices = opts.voices;
        this.getPos = opts.getPos;
        this.range = opts.range;
        this.playing = null; // the sound thats playing rn
        this.next = null; // plays when current line is done
        this.lastLine = {};
        this.lastPath = null;

        this.gain = ac.createGain();
        this.gain.connect(ac.destination);
    }
    //plays even if it interrups another sounds
    shot(event){
        this.play(event);
    }

    say(event, opts = {}) {
        if (opts.interrupt) this.stop();
        if (this.playing) this.next = event;
        else this.play(event);
    }

    // for stuff that doesnt matter if it gets skipped
    sayIfQuiet(event) {
        if (!this.playing && !this.next) this.play(event);
    }

    stop() {
        this.next = null;
        if (!this.playing) return;
        this.playing.onended = null; // or else onended runs later and breaks the next line
        this.playing.stop();
        this.done();
    }

    done() {
        this.playing = null;
        const i = talking.indexOf(this);
        if (i !== -1) talking.splice(i, 1);
    }

    play(event) {
        const path = this.randomPath(event);
        if (!sounds[path]) return;

        const src = ac.createBufferSource();
        src.buffer = sounds[path];
        src.connect(this.gain);
        src.onended = () => {
            this.done();
            const e = this.next;
            this.next = null;
            if (e) this.play(e);
        };

        this.playing = src;
        if (!talking.includes(this)) talking.push(this);
        this.setVolume(true);
        src.start();
    }

    // random line but not same as last time, unless theres only one (Fire and ThereSheIs)
    randomPath(event) {
        const lines = this.voices[event];
        let i = Math.floor(Math.random() * lines.length);
        if (i === this.lastLine[event] && lines.length > 1) i = (i + 1) % lines.length;
        this.lastLine[event] = i;

        // same thing but for the takes
        const t = lines[i];
        let j = Math.floor(Math.random() * t.length);
        if (t[j] === this.lastPath && t.length > 1) j = (j + 1) % t.length;
        this.lastPath = t[j];
        return t[j];
    }

    // louder the closer you are
    setVolume(instant) {
        const pos = this.getPos();
        const dx = pos.x - player.x;
        const dy = pos.y - player.y;
        const vol = Math.max(0, 1 - Math.hypot(dx, dy) / this.range) * AUDIO.volume;

        if (instant) this.gain.gain.value = vol;
        else this.gain.gain.setTargetAtTime(vol, ac.currentTime, 0.03); // smooth so it doesnt click
    }
}

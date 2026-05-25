// Strayz audio manager — SFX via Web Audio API (no asset deps), music via HTMLAudioElement.
import { getSoundEnabled } from "@/lib/gameStore";

let _ctx = null;
function ctx() {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      _ctx = null;
    }
  }
  return _ctx;
}

function tone({ freq = 440, dur = 0.18, type = "sine", vol = 0.18, slideTo }) {
  if (!getSoundEnabled()) return;
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
  }
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

function chord(notes, options = {}) {
  notes.forEach((n, i) => {
    setTimeout(() => tone({ freq: n, ...options }), i * 70);
  });
}

export const sfx = {
  click: () => tone({ freq: 660, dur: 0.06, type: "square", vol: 0.08 }),
  hover: () => tone({ freq: 520, dur: 0.04, type: "sine", vol: 0.05 }),
  correct: () => chord([523.25, 659.25, 783.99], { dur: 0.22, type: "triangle", vol: 0.18 }),
  wrong: () => tone({ freq: 220, dur: 0.35, type: "sawtooth", vol: 0.14, slideTo: 110 }),
  hint: () => chord([880, 1046.5], { dur: 0.15, type: "sine", vol: 0.12 }),
  coin: () => chord([1318.51, 1567.98], { dur: 0.1, type: "triangle", vol: 0.18 }),
  levelUp: () =>
    chord([523.25, 659.25, 783.99, 1046.5], { dur: 0.28, type: "triangle", vol: 0.2 }),
  pop: () => tone({ freq: 880, dur: 0.08, type: "square", vol: 0.1 }),
  drop: () => tone({ freq: 300, dur: 0.1, type: "square", vol: 0.12, slideTo: 180 }),
  rotate: () => tone({ freq: 740, dur: 0.05, type: "square", vol: 0.08 }),
  lineClear: () => chord([783.99, 987.77, 1174.66], { dur: 0.18, type: "sine", vol: 0.2 }),
};

// --- Background music using Howler (royalty-free Mixkit CDN) ---
let bgInstance = null;

const BG_TRACKS = {
  menu: "https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3",
  level: "https://assets.mixkit.co/music/preview/mixkit-game-show-suspense-waiting-668.mp3",
  endless: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
};

export async function playMusic(trackKey = "menu") {
  if (!getSoundEnabled()) {
    stopMusic();
    return;
  }
  if (bgInstance?._trackKey === trackKey) return;
  stopMusic();
  const url = BG_TRACKS[trackKey];
  if (!url) return;
  try {
    const { Howl } = await import("howler");
    bgInstance = new Howl({
      src: [url],
      html5: true,
      loop: true,
      volume: 0.22,
      onloaderror: () => {
        // Fail silently — game still works without music
        bgInstance = null;
      },
      onplayerror: () => {
        bgInstance = null;
      },
    });
    bgInstance._trackKey = trackKey;
    bgInstance.play();
  } catch {
    // ignore
  }
}

export function stopMusic() {
  if (bgInstance) {
    try {
      bgInstance.stop();
      bgInstance.unload();
    } catch {
      // ignore
    }
    bgInstance = null;
  }
}

export function refreshMusicForSetting() {
  if (!getSoundEnabled()) {
    stopMusic();
  }
}

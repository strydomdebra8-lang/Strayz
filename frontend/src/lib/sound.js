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

// --- Procedural background music using Web Audio API ---
// 100% reliable, no external CDN dependencies. Each track is a layered
// looping pad + arpeggio in a different key/mood.
let bgState = null; // { stop: () => void, trackKey: string }

const SCALES = {
  // [bass note Hz, chord intervals, arpeggio melody freqs]
  menu: {
    bass: 130.81, // C3
    pad: [196.0, 246.94, 293.66], // G3 B3 D4
    melody: [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33],
    bpm: 78,
  },
  level: {
    bass: 110.0, // A2
    pad: [164.81, 220.0, 246.94], // E3 A3 B3
    melody: [440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0, 392.0],
    bpm: 96,
  },
  endless: {
    bass: 146.83, // D3
    pad: [220.0, 277.18, 329.63], // A3 C#4 E4
    melody: [587.33, 659.25, 698.46, 880.0, 698.46, 659.25, 587.33, 523.25],
    bpm: 88,
  },
};

function startProceduralTrack(trackKey) {
  const ac = ctx();
  if (!ac) return null;
  if (ac.state === "suspended") {
    ac.resume().catch(() => {});
  }
  const cfg = SCALES[trackKey] || SCALES.menu;
  const master = ac.createGain();
  master.gain.value = 0.18;
  master.connect(ac.destination);

  const oscillators = [];
  const timers = [];

  // Pad (slow attack/release continuous chord)
  cfg.pad.forEach((freq) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(master);
    osc.start();
    oscillators.push(osc);
  });

  // Slow bass pulse
  const bass = ac.createOscillator();
  const bassGain = ac.createGain();
  bass.type = "triangle";
  bass.frequency.value = cfg.bass;
  bassGain.gain.value = 0.0;
  bass.connect(bassGain).connect(master);
  bass.start();
  oscillators.push(bass);
  const beatMs = (60 / cfg.bpm) * 1000;
  const bassPulse = setInterval(() => {
    const t = ac.currentTime;
    bassGain.gain.cancelScheduledValues(t);
    bassGain.gain.setValueAtTime(0.12, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  }, beatMs * 2);
  timers.push(bassPulse);

  // Melody arpeggio
  let step = 0;
  const melodyTick = setInterval(() => {
    if (!getSoundEnabled()) return;
    const freq = cfg.melody[step % cfg.melody.length];
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.45);
    step++;
  }, beatMs);
  timers.push(melodyTick);

  return {
    trackKey,
    stop: () => {
      timers.forEach((t) => clearInterval(t));
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          // Expected: oscillator already stopped — Web Audio API throws on double-stop.
        }
      });
      try {
        master.disconnect();
      } catch {
        // Expected: node may already be disconnected.
      }
    },
  };
}

export async function playMusic(trackKey = "menu") {
  if (!getSoundEnabled()) {
    stopMusic();
    return;
  }
  if (bgState?.trackKey === trackKey) return;
  stopMusic();
  bgState = startProceduralTrack(trackKey);
}

export function stopMusic() {
  if (bgState) {
    bgState.stop();
    bgState = null;
  }
}

export function refreshMusicForSetting() {
  if (!getSoundEnabled()) {
    stopMusic();
  }
}

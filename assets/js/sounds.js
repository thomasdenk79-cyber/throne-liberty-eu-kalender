export const CURATED_SOUNDS = [
  { id: "none", labelKey: "soundNone" },
  { id: "gentle", labelKey: "soundGentle" },
  { id: "neon", labelKey: "soundNeon" },
  { id: "action", labelKey: "soundAction" },
  { id: "vortex", labelKey: "soundVortex" },
  { id: "finale", labelKey: "soundFinale" }
];

const LEGACY_SOUND_MAP = {
  none: "none",
  gentle: "gentle",
  crystal: "gentle",
  bell: "gentle",
  harp: "gentle",
  celestial: "gentle",
  droplet: "gentle",
  windchime: "gentle",
  softpulse: "gentle",
  amitoi: "gentle",
  neon: "neon",
  urgent: "neon",
  siren: "neon",
  alarm: "neon",
  doublepulse: "neon",
  action: "action",
  warhorn: "action",
  drums: "action",
  thunder: "action",
  dragon: "action",
  vortex: "vortex",
  arcane: "vortex",
  finale: "finale"
};

const PATTERNS = {
  gentle: {
    type: "sine",
    gain: 0.038,
    notes: [[0, 659.25, 0.34], [0.42, 880, 0.5], [0.98, 1046.5, 0.6]]
  },
  neon: {
    type: "square",
    gain: 0.038,
    notes: [[0, 146.83, 0.2], [0.25, 220, 0.2], [0.5, 293.66, 0.2], [0.75, 440, 0.35]]
  },
  action: {
    type: "sawtooth",
    gain: 0.042,
    notes: [[0, 98, 0.22, 65.41], [0.32, 196, 0.38, 293.66], [0.82, 146.83, 0.3], [1.18, 246.94, 0.52]]
  },
  vortex: {
    type: "triangle",
    gain: 0.036,
    notes: [[0, 329.63, 0.35, 440], [0.28, 493.88, 0.42, 659.25], [0.66, 739.99, 0.55, 987.77]]
  },
  finale: {
    type: "triangle",
    gain: 0.044,
    notes: [[0, 392, 0.28], [0.22, 523.25, 0.3], [0.44, 659.25, 0.32], [0.68, 783.99, 0.4], [1.02, 1046.5, 0.65]]
  }
};

export function normalizeSoundId(value, fallback = "none") {
  return LEGACY_SOUND_MAP[String(value || "").toLowerCase()]
    || LEGACY_SOUND_MAP[fallback]
    || "none";
}

export function soundDurationSeconds(value, fallback = 10) {
  const seconds = Math.round(Number(value));
  return Number.isFinite(seconds) && seconds >= 1 && seconds <= 60
    ? seconds
    : fallback;
}

export function scheduleNotificationSound(audioContext, soundId = "gentle", durationSeconds = 10) {
  const normalizedSound = normalizeSoundId(soundId, "gentle");
  if (normalizedSound === "none") return;
  if (!audioContext) throw new Error("Web Audio context is unavailable");

  const pattern = PATTERNS[normalizedSound];
  const requestedDuration = soundDurationSeconds(durationSeconds);
  const startAt = audioContext.currentTime + 0.03;
  const stopAt = startAt + requestedDuration;
  const patternLength = Math.max(...pattern.notes.map(([offset, , duration]) => offset + duration)) + 0.45;

  for (let loopStart = startAt; loopStart < stopAt; loopStart += patternLength) {
    for (const [offset, frequency, noteDuration, endFrequency] of pattern.notes) {
      const noteStart = loopStart + offset;
      if (noteStart >= stopAt) continue;
      const noteEnd = Math.min(noteStart + noteDuration, stopAt);
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = pattern.type;
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      if (endFrequency && noteEnd > noteStart) {
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, noteEnd);
      }
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(pattern.gain, Math.min(noteStart + 0.035, noteEnd));
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.03);
    }
  }
}

import { ref } from "vue";
import highUrl from "@assets/metronomeSounds/high.wav";
import lowUrl from "@assets/metronomeSounds/low.wav";

export interface TempoPoint {
  bar: number;
  bpm: number;
}

export function useMetronomeEngine() {
  const isRunning = ref(false);
  const currentBar = ref(0); // used for scheduling
  const visualBar = ref(0); // used for UI playhead

  let ctx: AudioContext | null = null;
  let hiBuf: AudioBuffer | null = null;
  let loBuf: AudioBuffer | null = null;

  async function loadSample(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed loading sample: " + url);
    const arr = await res.arrayBuffer();
    if (!ctx) throw new Error("AudioContext not initialized");
    return await ctx.decodeAudioData(arr);
  }

  async function load() {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    hiBuf = await loadSample(highUrl);
    loBuf = await loadSample(lowUrl);
  }

  function bpmAtBar(bar: number, pts: TempoPoint[]): number {
    const [a, b, c] = pts as [TempoPoint, TempoPoint, TempoPoint];
    if (bar <= b.bar) {
      const t = (bar - a.bar) / (b.bar - a.bar || 1);
      return a.bpm + t * (b.bpm - a.bpm);
    }
    if (bar <= c.bar) {
      const t = (bar - b.bar) / (c.bar - b.bar || 1);
      return b.bpm + t * (c.bpm - b.bpm);
    }
    return c.bpm;
  }

  function buildTempoMap(pts: TempoPoint[]): number[] {
    if (!pts[2]) return [];
    const last = pts[2].bar;
    const out: number[] = [];
    for (let i = 0; i <= last; i++) {
      out.push(bpmAtBar(i, pts));
    }
    return out;
  }

  async function start(
    points: [TempoPoint, TempoPoint, TempoPoint],
    infinite: boolean
  ) {
    if (!ctx) await load();
    if (!ctx || !hiBuf || !loBuf) return;

    if (ctx.state === "suspended") await ctx.resume();

    isRunning.value = true;
    currentBar.value = 0;
    visualBar.value = 0;

    const LOOK_AHEAD_MS = 25;
    const SCHEDULE_AHEAD_TIME = 0.1; // seconds
    const lastBar = points[2].bar;

    let nextBeatTime = ctx.currentTime;
    let beatInBar = 0;

    const scheduler = setInterval(() => {
      if (!ctx || !isRunning.value) {
        clearInterval(scheduler);
        return;
      }

      while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
        // Stop if exceeded last bar
        if (!infinite && currentBar.value > lastBar) {
          stop();
          clearInterval(scheduler);
          return;
        }

        const bpm = bpmAtBar(currentBar.value, points);
        const secondsPerBeat = 60 / bpm / 2;

        const source = ctx.createBufferSource();
        source.buffer = beatInBar === 0 ? hiBuf! : loBuf!;
        source.connect(ctx.destination);

        // Schedule sound
        source.start(nextBeatTime);

        // Update visualBar only on first beat of bar
        if (beatInBar === 0) visualBar.value = currentBar.value;

        // Advance beat
        nextBeatTime += secondsPerBeat;
        beatInBar++;
        if (beatInBar > 3) {
          beatInBar = 0;
          currentBar.value++;
        }
      }
    }, LOOK_AHEAD_MS);
  }

  function stop() {
    isRunning.value = false;
  }

  return {
    start,
    stop,
    isRunning,
    currentBar,
    visualBar,
    buildTempoMap,
  };
}

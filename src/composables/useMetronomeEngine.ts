import { ref } from "vue";
import highUrl from "@assets/metronomeSounds/high.wav";
import lowUrl from "@assets/metronomeSounds/low.wav";

export interface TempoPoint {
  bar: number; // Cell index
  bpm: number;
}

export function useMetronomeEngine() {
  const isRunning = ref(false);
  const currentBar = ref(0);
  const visualBar = ref(0);
  const currentBpm = ref(0);

  const TOTAL_CELLS = 16;

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

  function bpmAtBar(
    bar: number,
    pts: [TempoPoint, TempoPoint, TempoPoint],
    barsPerCell: number
  ): number {
    const a = { bar: pts[0].bar * barsPerCell, bpm: pts[0].bpm };
    const b = { bar: pts[1].bar * barsPerCell, bpm: pts[1].bpm };
    const c = { bar: pts[2].bar * barsPerCell, bpm: pts[2].bpm };

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

  function buildTempoMap(
    pts: [TempoPoint, TempoPoint, TempoPoint],
    barsPerCell: number = 1
  ): number[] {
    const totalBars = TOTAL_CELLS * barsPerCell;
    const out: number[] = [];
    for (let i = 0; i < totalBars; i++) {
      const cellStart = Math.floor(i / barsPerCell) * barsPerCell;
      out.push(bpmAtBar(cellStart, pts, barsPerCell));
    }
    return out;
  }

  async function start(
    points: [TempoPoint, TempoPoint, TempoPoint],
    stopAtEnd: boolean,
    barsPerCell: number = 1
  ) {
    if (!ctx) await load();
    if (!ctx || !hiBuf || !loBuf) return;
    if (ctx.state === "suspended") await ctx.resume();

    isRunning.value = true;
    currentBar.value = 0;
    visualBar.value = 0;

    const LOOK_AHEAD_MS = 25;
    const SCHEDULE_AHEAD_TIME = 0.1;
    const totalBarsInGrid = TOTAL_CELLS * barsPerCell;

    let nextBeatTime = ctx.currentTime;
    let beatInBar = 0;

    const scheduler = setInterval(() => {
      if (!isRunning.value) {
        clearInterval(scheduler);
        return;
      }

      if (!ctx) return;

      while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
        if (stopAtEnd && currentBar.value >= totalBarsInGrid) {
          stop();
          break;
        }

        const cellStart =
          Math.floor(currentBar.value / barsPerCell) * barsPerCell;
        const activeBpm = bpmAtBar(cellStart, points, barsPerCell);
        const secondsPerBeat = 60 / activeBpm / 2;

        const source = ctx!.createBufferSource();
        source.buffer = beatInBar === 0 ? hiBuf! : loBuf!;
        source.connect(ctx!.destination);
        source.start(nextBeatTime);

        if (beatInBar === 0) {
          visualBar.value = currentBar.value;
          if (currentBar.value === cellStart) {
            currentBpm.value = Math.round(activeBpm);
          }
        }

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
    currentBpm,
    buildTempoMap,
  };
}

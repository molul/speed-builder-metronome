import { ref } from "vue";
import highUrl from "@assets/metronomeSounds/high.wav";
import lowUrl from "@assets/metronomeSounds/low.wav";

export interface TempoPoint {
  bar: number; // Cell index
  bpm: number;
}

// Added the type for the new feature
export type TempoStep = "bar" | "cell";

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

    if (bar <= a.bar) return a.bpm;

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
    barsPerCell: number = 1,
    tempoStep: TempoStep = "cell" // Defaulting to cell
  ): number[] {
    const totalBars = TOTAL_CELLS * barsPerCell;
    const out: number[] = [];
    for (let i = 0; i < totalBars; i++) {
      // Logic for step calculation
      const targetBar =
        tempoStep === "cell" ? Math.floor(i / barsPerCell) * barsPerCell : i;
      out.push(bpmAtBar(targetBar, pts, barsPerCell));
    }
    return out;
  }




/*
  async function start(
    points: [TempoPoint, TempoPoint, TempoPoint],
    stopAtEnd: boolean,
    barsPerCell: number = 1,
    tempoStep: TempoStep = "cell" // Added parameter
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

        // Logic switch for tempo increase
        const calculationBar =
          tempoStep === "cell"
            ? Math.floor(currentBar.value / barsPerCell) * barsPerCell
            : currentBar.value;

        const activeBpm = bpmAtBar(calculationBar, points, barsPerCell);
        const secondsPerBeat = 60 / activeBpm; // Fixed: Standard 4/4 is 60/BPM, your code had /2 (8th notes?)

        const source = ctx!.createBufferSource();
        source.buffer = beatInBar === 0 ? hiBuf! : loBuf!;
        source.connect(ctx!.destination);
        source.start(nextBeatTime);

        if (beatInBar === 0) {
          visualBar.value = currentBar.value;
          currentBpm.value = Math.round(activeBpm);
        }

        nextBeatTime += secondsPerBeat / 4; // Assuming 4 beats per bar
        beatInBar++;
        if (beatInBar > 3) {
          beatInBar = 0;
          currentBar.value++;
        }
      }
    }, LOOK_AHEAD_MS);
  }
*/

  async function start(
    points: [TempoPoint, TempoPoint, TempoPoint],
    stopAtEnd: boolean,
    barsPerCell: number = 1,
    tempoStep: TempoStep = "cell"
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

        const calculationBar =
          tempoStep === "cell"
            ? Math.floor(currentBar.value / barsPerCell) * barsPerCell
            : currentBar.value;

        const activeBpm = bpmAtBar(calculationBar, points, barsPerCell);
        
        // Corrected: 60 / BPM is exactly one quarter note beat
        const secondsPerBeat = 60 / activeBpm;

        const source = ctx!.createBufferSource();
        source.buffer = beatInBar === 0 ? hiBuf! : loBuf!;
        source.connect(ctx!.destination);
        source.start(nextBeatTime);

        if (beatInBar === 0) {
          visualBar.value = currentBar.value;
          currentBpm.value = Math.round(activeBpm);
        }

        // Increment by the full beat duration
        nextBeatTime += secondsPerBeat; 
        
        beatInBar++;
        // Reset after 4 beats to complete one full bar in 4/4 time
        if (beatInBar >= 4) {
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

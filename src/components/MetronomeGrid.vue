<script setup lang="ts">
import { computed, ref, watch, type Ref, type UnwrapRef } from "vue";
import type { TempoPoint } from "../composables/useMetronomeEngine";

// Point in the grid
interface GridPoint {
  col: number;
  row: number;
}

// Props
interface Props {
  cols: number;
  rows: number;
  startBpm: number;
  maxBpm: number;
  endBpm: number;
  barsPerCell: number;
  tempoMap: number[];
  playheadBar: number | Ref<number>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:points", points: [TempoPoint, TempoPoint, TempoPoint]): void;
}>();

const container = ref<HTMLDivElement | null>(null);
const w = ref(300);
const h = ref(500);

// ====== Responsive sizing ======
function resize() {
  const cw = container.value?.clientWidth ?? 300;
  const maxH = window.innerHeight * 0.7;
  w.value = cw;
  h.value = Math.min(maxH, cw * 2);
}

watch(container, () => {
  resize();
  window.addEventListener("resize", resize);
});

// ====== Grid cell sizes ======
const cellW = computed(() => w.value / props.cols);
const cellH = computed(() => h.value / props.rows);

// ====== BPM / row conversions ======
function bpmToRow(bpm: number): number {
  return props.rows - Math.round((bpm - 40) / 5);
}
function rowToBpm(row: number): number {
  return 40 + (props.rows - row) * 5;
}

// ====== Grid points ======
const points = ref<GridPoint[]>([
  { col: 0, row: bpmToRow(props.startBpm) },
  { col: 8, row: bpmToRow(props.maxBpm) },
  { col: 12, row: bpmToRow(props.endBpm) },
]);

watch(
  () => [props.startBpm, props.maxBpm, props.endBpm],
  () => {
    if (!points.value[0] || !points.value[1] || !points.value[2]) return;
    points.value[0].row = bpmToRow(props.startBpm);
    points.value[1].row = bpmToRow(props.maxBpm);
    points.value[2].row = bpmToRow(props.endBpm);
  }
);

// ====== SVG coordinates ======
function svgPt(p: GridPoint) {
  return {
    x: (p.col - 1) * cellW.value,
    y: (p.row - 1) * cellH.value,
  };
}

// ====== Drag & drop ======
const dragging = ref<number | null>(null);

function clampCol(i: number, col: number) {
  if (!points.value[0] || !points.value[1] || !points.value[2]) return col;

  if (i === 0) return Math.min(col, points.value[1].col - 1);
  if (i === 1)
    return Math.max(
      points.value[0].col + 1,
      Math.min(col, points.value[2].col - 1)
    );
  return Math.max(col, points.value[1].col + 1);
}

function down(i: number) {
  dragging.value = i;
}

function move(e: MouseEvent) {
  if (dragging.value === null) return;
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();

  let col = Math.floor((e.clientX - r.left) / cellW.value);
  let row = Math.floor((e.clientY - r.top) / cellH.value);

  col = Math.max(0, Math.min(props.cols - 1, col));
  row = Math.max(0, Math.min(props.rows - 1, row));
  col = clampCol(dragging.value, col);

  points.value[dragging.value] = { col, row };
}

function up() {
  if (dragging.value === null) return;
  dragging.value = null;

  emit(
    "update:points",
    points.value.map((p) => ({
      bar: p.col * props.barsPerCell,
      bpm: rowToBpm(p.row),
    })) as [TempoPoint, TempoPoint, TempoPoint]
  );
}

// ====== Line segments between points ======
const segments = computed(() => {
  // Ensure points has 3 elements
  if (points.value.length < 3) return [];

  // TypeScript knows p[0], p[1], p[2] exist
  const p = points.value.map(svgPt) as [
    ReturnType<typeof svgPt>,
    ReturnType<typeof svgPt>,
    ReturnType<typeof svgPt>
  ];
  const last = { x: w.value, y: p[2].y };

  return [
    [p[0], p[1]],
    [p[1], p[2]],
    [p[2], last],
  ] as const;
});

// ====== Playhead ======
const playheadX = computed<number | null>(() => {
  if (props.playheadBar == null) return null;

  // Unwrap ref if needed
  const bar =
    typeof props.playheadBar === "number"
      ? props.playheadBar
      : props.playheadBar.value;

  if (isNaN(bar)) return null;

  const col = bar / props.barsPerCell;
  return col * cellW.value + cellW.value / 2;
});

// Highlighted column (TS-safe)
const currentCol = computed<number | null>(() => {
  if (props.playheadBar == null) return null;

  const bar =
    typeof props.playheadBar === "number"
      ? props.playheadBar
      : props.playheadBar.value;
  if (isNaN(bar)) return null;

  return Math.min(props.cols - 1, Math.floor(bar / props.barsPerCell));
});
</script>

<template>
  <div ref="container" class="w-full">
    <svg
      :width="w"
      :height="h"
      @mousemove="move"
      @mouseup="up"
      class="border select-none touch-none bg-white"
    >
      <!-- Grid -->
      <g stroke="#ddd">
        <line
          v-for="c in cols + 1"
          :key="`lineCol-${c}`"
          :x1="(c - 1) * cellW"
          y1="0"
          :x2="(c - 1) * cellW"
          :y2="h"
        />
        <line
          v-for="r in rows + 1"
          x1="0"
          :y1="(r - 1) * cellH"
          :key="`lineRow-${r}`"
          :x2="w"
          :y2="(r - 1) * cellH"
        />
      </g>

      <!-- Tempo labels -->
      <text
        v-for="r in rows"
        :key="`textRow-${r}`"
        :x="2"
        :y="(r - 1) * cellH + 10"
        class="text-[8px] fill-gray-500"
      >
        {{ 40 + (rows - r) * 5 }}
      </text>

      <!-- Lines connecting points -->
      <g stroke="black" stroke-width="2">
        <line
          v-for="(s, i) in segments"
          :key="`segment-${i}`"
          :x1="s[0].x"
          :y1="s[0].y"
          :x2="s[1].x"
          :y2="s[1].y"
        />
      </g>

      <!-- Playhead rectangle -->
      <rect
        v-if="currentCol !== null"
        :x="currentCol * cellW"
        y="0"
        :width="cellW"
        :height="h"
        class="fill-blue-300 opacity-40"
      />

      <!-- Playhead line (red) -->
      <line
        v-if="playheadX"
        :x1="playheadX - cellW / 2"
        y1="0"
        :x2="playheadX - cellW / 2"
        :y2="h"
        stroke="red"
        stroke-width="2"
      />

      <!-- Points -->
      <circle
        v-for="(p, i) in points"
        :key="`point-${i}`"
        :cx="svgPt(p).x"
        :cy="svgPt(p).y"
        r="8"
        fill="blue"
        @mousedown="down(i)"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import type { TempoPoint } from "../composables/useMetronomeEngine";

interface GridPoint {
  col: number;
  row: number;
}

interface Props {
  cols: number;
  rows: number;
  startBpm: number;
  maxBpm: number;
  endBpm: number;
  barsPerCell: number;
  tempoMap: number[];
  playheadBar: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:points", points: [TempoPoint, TempoPoint, TempoPoint]): void;
}>();

const container = ref<HTMLDivElement | null>(null);
const w = ref(300);
const h = ref(500);

function resize() {
  if (!container.value) return;
  const cw = container.value.clientWidth;
  w.value = cw;
  h.value = Math.min(window.innerHeight * 0.7, cw * 1.5);
}

onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
});

onUnmounted(() => {
  window.removeEventListener("resize", resize);
});

const cellW = computed(() => w.value / props.cols);
const cellH = computed(() => h.value / props.rows);

const bpmToRow = (bpm: number) => props.rows - Math.round((bpm - 40) / 5);
const rowToBpm = (row: number) => 40 + (props.rows - row) * 5;

const points = ref<GridPoint[]>([
  { col: 0, row: bpmToRow(props.startBpm) },
  { col: 8, row: bpmToRow(props.maxBpm) },
  { col: 12, row: bpmToRow(props.endBpm) },
]);

// Sync dots if props change from parent
watch(
  () => [props.startBpm, props.maxBpm, props.endBpm] as const,
  ([s, m, e]) => {
    const pts = points.value;
    if (pts[0] && pts[1] && pts[2]) {
      pts[0].row = bpmToRow(s);
      pts[1].row = bpmToRow(m);
      pts[2].row = bpmToRow(e);
    }
  }
);
const dragging = ref<number | null>(null);

// Mobile + Desktop start dragging
const down = (i: number, e: MouseEvent | TouchEvent) => {
  // Prevent scrolling while dragging on mobile
  if (e.cancelable) e.preventDefault();
  dragging.value = i;
};

function up() {
  if (dragging.value === null) return;

  emit(
    "update:points",
    points.value.map((p) => ({
      bar: p.col,
      bpm: rowToBpm(p.row),
    })) as [TempoPoint, TempoPoint, TempoPoint]
  );
  dragging.value = null;
}

function move(e: MouseEvent | TouchEvent) {
  if (dragging.value === null || !container.value) return;

  const [p0, p1, p2] = points.value;
  if (!p0 || !p1 || !p2) return;

  const r = container.value.getBoundingClientRect();

  // 1. Declare variables HERE so they are visible to the whole function
  let clientX = 0;
  let clientY = 0;

  if ("touches" in e) {
    const touch = e.touches[0];
    if (!touch) return;
    // 2. Assign values (no 'let' here)
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    // 3. Assign values (no 'let' here)
    clientX = (e as MouseEvent).clientX;
    clientY = (e as MouseEvent).clientY;
  }

  // Now clientX and clientY are defined and accessible here!
  let col = Math.floor((clientX - r.left) / cellW.value);
  let row = Math.floor((clientY - r.top) / cellH.value);

  col = Math.max(0, Math.min(props.cols - 1, col));
  row = Math.max(0, Math.min(props.rows - 1, row));

  if (dragging.value === 0) {
    col = Math.min(col, p1.col - 1);
  } else if (dragging.value === 1) {
    col = Math.max(p0.col + 1, Math.min(col, p2.col - 1));
  } else if (dragging.value === 2) {
    col = Math.max(col, p1.col + 1);
  }

  points.value[dragging.value] = { col, row };
}

const svgPt = (p: GridPoint) => ({
  x: p.col * cellW.value,
  y: p.row * cellH.value,
});

// Fixed TS typing for segments
const segments = computed(() => {
  const [p0, p1, p2] = points.value;
  if (!p0 || !p1 || !p2) return [];

  const pt0 = svgPt(p0);
  const pt1 = svgPt(p1);
  const pt2 = svgPt(p2);

  // Define the start and end horizontal anchors
  const first = { x: 0, y: pt0.y };
  const last = { x: w.value, y: pt2.y };

  return [
    { x1: first.x, y1: first.y, x2: pt0.x, y2: pt0.y }, // New line: Left edge to Dot 1
    { x1: pt0.x, y1: pt0.y, x2: pt1.x, y2: pt1.y }, // Dot 1 to Dot 2
    { x1: pt1.x, y1: pt1.y, x2: pt2.x, y2: pt2.y }, // Dot 2 to Dot 3
    { x1: pt2.x, y1: pt2.y, x2: last.x, y2: last.y }, // Dot 3 to Right edge
  ];
});

const playheadX = computed(() => {
  const bar =
    typeof props.playheadBar === "object"
      ? props.playheadBar.value
      : props.playheadBar;
  if (bar === null || bar === undefined) return 0;
  return (bar / props.barsPerCell) * cellW.value;
});

const currentCol = computed(() => {
  const bar =
    typeof props.playheadBar === "object"
      ? props.playheadBar.value
      : props.playheadBar;
  if (bar === null || bar === undefined) return null;
  return Math.min(props.cols - 1, Math.floor(bar / props.barsPerCell));
});
</script>

<template>
  <div ref="container" class="w-full bg-white relative">
    <svg
      :width="w"
      :height="h"
      @mousemove="move"
      @mouseup="up"
      @mouseleave="up"
      @touchmove.prevent="move"
      @touchend="up"
      class="select-none touch-none"
    >
      <g stroke="#eee">
        <line
          v-for="c in cols + 1"
          :key="`col-${c}`"
          :x1="(c - 1) * cellW"
          y1="0"
          :x2="(c - 1) * cellW"
          :y2="h"
        />
        <line
          v-for="r in rows + 1"
          :key="`row-${r}`"
          x1="0"
          :y1="(r - 1) * cellH"
          :x2="w"
          :y2="(r - 1) * cellH"
        />
      </g>

      <text
        v-for="r in rows"
        :key="`label-${r}`"
        :x="2"
        :y="(r - 1) * cellH + 10"
        class="text-[8px] fill-gray-500 pointer-events-none"
      >
        {{ 40 + (rows - r) * 5 }}
      </text>

      <rect
        v-if="currentCol !== null"
        :x="currentCol * cellW"
        y="0"
        :width="cellW"
        :height="h"
        fill="rgba(200,200,255,0.4)"
      />
      <line
        v-if="playheadBar !== null"
        :x1="playheadX"
        y1="0"
        :x2="playheadX"
        :y2="h"
        stroke="red"
        stroke-width="2"
      />

      <g stroke="black" stroke-width="2">
        <line
          v-for="(s, i) in segments"
          :key="`seg-${i}`"
          :x1="s.x1"
          :y1="s.y1"
          :x2="s.x2"
          :y2="s.y2"
        />
      </g>

      <circle
        v-for="(p, i) in points"
        :key="`pt-${i}`"
        :cx="svgPt(p).x"
        :cy="svgPt(p).y"
        r="12"
        fill="blue"
        class="cursor-pointer"
        @mousedown="down(i, $event)"
        @touchstart.prevent="down(i, $event)"
      />
    </svg>
  </div>
</template>

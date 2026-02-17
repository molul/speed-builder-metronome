<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'
import type { TempoPoint } from '../composables/useMetronomeEngine'
import MetronomeTempos from './MetronomeTempos.vue'

interface GridPoint {
  col: number
  row: number
}

interface Props {
  cols: number
  rows: number
  playheadBar: any
}

const props = defineProps<Props>()
const store = useMetronomeStore()

const tempoColumnWidth = 30
const padding = 16
const container = ref<HTMLDivElement | null>(null)
const w = ref(300)
const h = ref(500)

function resize() {
  if (!container.value) return
  const cw = container.value.clientWidth
  w.value = cw - tempoColumnWidth - padding * 2
  // w.value = 320
  h.value = 518
  //h.value = Math.min(window.innerHeight * 0.7, cw * 1.5)
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})

const cellW = computed(() => w.value / props.cols)
const cellH = computed(() => h.value / props.rows)

const bpmToRow = (bpm: number) => Math.round(props.rows - (bpm - 40) / 5)
const rowToBpm = (row: number) => 40 + (props.rows - row) * 5

const points = ref<GridPoint[]>([])

const syncPointsFromStore = () => {
  points.value = store.config.points.map(p => ({
    col: p.bar,
    row: bpmToRow(p.bpm)
  }))
}

watch(() => store.config.points, syncPointsFromStore, {
  deep: true,
  immediate: true
})

const dragging = ref<number | null>(null)

const down = (i: number, e: MouseEvent | TouchEvent) => {
  if (store.isRunning) return
  if (e.cancelable) e.preventDefault()
  dragging.value = i
}

function up() {
  if (dragging.value === null) return
  store.updatePoints(
    points.value.map(p => ({
      bar: p.col,
      bpm: rowToBpm(p.row)
    })) as [TempoPoint, TempoPoint, TempoPoint]
  )
  dragging.value = null
}

function move(e: MouseEvent | TouchEvent) {
  if (store.isRunning || dragging.value === null || !container.value) return

  const p0 = points.value[0]
  const p1 = points.value[1]
  const p2 = points.value[2]

  const svgEl = container.value.querySelector('svg')
  if (!svgEl || !p0 || !p1 || !p2) return

  const rect = svgEl.getBoundingClientRect()

  // Fix: Object is possibly 'undefined' for touches
  let clientX = 0
  let clientY = 0

  if ('touches' in e) {
    const touch = e.touches[0]
    if (!touch) return // Guard against empty touch list
    clientX = touch.clientX
    clientY = touch.clientY
  } else {
    clientX = (e as MouseEvent).clientX
    clientY = (e as MouseEvent).clientY
  }

  const internalX = ((clientX - rect.left) / rect.width) * w.value
  const internalY = ((clientY - rect.top) / rect.height) * h.value

  let col = Math.max(0, Math.min(props.cols - 1, Math.floor(internalX / cellW.value)))
  let row = Math.max(0, Math.min(props.rows, Math.round(internalY / cellH.value)))

  points.value[dragging.value] = { col, row }

  store.updatePoints(
    points.value.map(p => ({
      bar: p.col,
      bpm: rowToBpm(p.row)
    })) as [TempoPoint, TempoPoint, TempoPoint]
  )
}

const svgPt = (p: GridPoint) => ({
  x: p.col * cellW.value,
  y: p.row * cellH.value
})

const draggedPointPos = computed(() => {
  if (dragging.value === null) return null
  const pt = points.value[dragging.value]
  // Fix: Type narrowing for svgPt
  if (!pt) return null
  return svgPt(pt)
})

const segments = computed(() => {
  const p0 = points.value[0]
  const p1 = points.value[1]
  const p2 = points.value[2]
  if (!p0 || !p1 || !p2) return []

  const pt0 = svgPt(p0)
  const pt1 = svgPt(p1)
  const pt2 = svgPt(p2)

  return [
    { x1: 0, y1: pt0.y, x2: pt0.x, y2: pt0.y },
    { x1: pt0.x, y1: pt0.y, x2: pt1.x, y2: pt1.y },
    { x1: pt1.x, y1: pt1.y, x2: pt2.x, y2: pt2.y },
    { x1: pt2.x, y1: pt2.y, x2: w.value, y2: pt2.y }
  ]
})

const playheadX = computed(() => {
  const bar =
    typeof props.playheadBar === 'object' ? props.playheadBar.value : props.playheadBar
  if (bar === null || bar === undefined) return 0
  return Math.max(0, Math.min(w.value, (bar / store.config.barsPerCell) * cellW.value))
})

const currentCol = computed(() => {
  const bar =
    typeof props.playheadBar === 'object' ? props.playheadBar.value : props.playheadBar
  if (bar === null || bar === undefined) return null
  return Math.min(props.cols - 1, Math.floor(bar / store.config.barsPerCell))
})
</script>

<template>
  <div ref="container" class="w-full flex px-4">
    <MetronomeTempos :height="h" />

    <div class="w-full bg-zinc-700">
      <svg
        :width="w"
        :height="h"
        @mousemove="move"
        @mouseup="up"
        @mouseleave="up"
        @touchmove.prevent="move"
        @touchend="up"
        class="w-full overflow-visible select-none touch-none"
      >
        <g class="stroke-zinc-500">
          <line
            v-for="c in cols + 1"
            :key="c"
            :x1="(c - 1) * cellW"
            y1="0"
            :x2="(c - 1) * cellW"
            :y2="h"
          />
          <line
            v-for="r in rows + 1"
            :key="r"
            x1="0"
            :y1="(r - 1) * cellH"
            :x2="w"
            :y2="(r - 1) * cellH"
          />
        </g>

        <rect
          v-if="currentCol !== null"
          :x="currentCol * cellW"
          y="0"
          :width="cellW"
          :height="h"
          fill="rgba(255,255,255,0.2)"
        />

        <line
          v-if="playheadBar !== null"
          :x1="playheadX"
          y1="0"
          :x2="playheadX"
          :y2="h"
          stroke-width="2"
          class="stroke-green-500"
        />

        <line
          v-if="draggedPointPos"
          x1="0"
          :y1="draggedPointPos.y"
          :x2="draggedPointPos.x"
          :y2="draggedPointPos.y"
          stroke-width="2"
          stroke-dasharray="6 6"
          class="stroke-blue-300 pointer-events-none"
        />

        <g stroke-width="2" class="stroke-white">
          <line
            v-for="(s, i) in segments"
            :key="i"
            :x1="s.x1"
            :y1="s.y1"
            :x2="s.x2"
            :y2="s.y2"
          />
        </g>

        <circle
          v-for="(p, i) in points"
          :key="i"
          :cx="svgPt(p).x"
          :cy="svgPt(p).y"
          r="12"
          :class="[
            'cursor-pointer',
            i === 0 ? 'fill-green-400' : i === 1 ? 'fill-red-400' : 'fill-yellow-400'
          ]"
          @mousedown="down(i, $event)"
          @touchstart.prevent="down(i, $event)"
        />
      </svg>
    </div>
  </div>
</template>

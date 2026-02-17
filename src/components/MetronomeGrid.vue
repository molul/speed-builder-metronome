<script setup lang="ts">
import { computed } from 'vue'
import { useMetronomeStore } from '../stores/useMetronomeStore'

interface Props {
  width: number
  height: number
  cols: number
  points: { col: number; row: number }[]
  playheadX: number
  currentCol: number | null
}

const props = defineProps<Props>()
const store = useMetronomeStore()

const emit = defineEmits<{
  (e: 'drag-start', index: number, event: MouseEvent | TouchEvent): void
  (e: 'drag-move', event: MouseEvent | TouchEvent): void
  (e: 'drag-end'): void
}>()

const cellW = computed(() => props.width / props.cols)
const cellH = computed(() => props.height / store.rows)

const svgPt = (p: { col: number; row: number }) => ({
  x: p.col * cellW.value,
  y: p.row * cellH.value
})

// Calculate the position of the point currently being dragged
const draggedPointPos = computed(() => {
  if (store.dragging === null) return null
  const pt = props.points[store.dragging]
  if (!pt) return null
  return svgPt(pt)
})

const segments = computed(() => {
  if (props.points.length < 3) return []
  const pts = props.points.map(svgPt)
  const p0 = pts[0]
  const p1 = pts[1]
  const p2 = pts[2]
  if (!p0 || !p1 || !p2) return []

  return [
    { x1: 0, y1: p0.y, x2: p0.x, y2: p0.y },
    { x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y },
    { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y },
    { x1: p2.x, y1: p2.y, x2: props.width, y2: p2.y }
  ]
})
</script>

<template>
  <div class="size-full bg-zinc-700">
    <svg
      :width="width"
      :height="height"
      @mousemove="emit('drag-move', $event)"
      @mouseup="emit('drag-end')"
      @mouseleave="emit('drag-end')"
      @touchmove.prevent="emit('drag-move', $event)"
      @touchend="emit('drag-end')"
      class="w-full overflow-visible select-none touch-none z-50"
    >
      <line
        v-if="playheadX > 0"
        :x1="playheadX"
        y1="0"
        :x2="playheadX"
        :y2="height"
        stroke-width="2"
        class="stroke-green-500"
      />

      <g class="stroke-zinc-500">
        <line
          v-for="c in cols + 1"
          :key="`c-${c}`"
          :x1="(c - 1) * cellW"
          y1="0"
          :x2="(c - 1) * cellW"
          :y2="height"
        />
        <line
          v-for="r in store.rows + 1"
          :key="`r-${r}`"
          x1="0"
          :y1="Math.floor((r - 1) * cellH)"
          :x2="width"
          :y2="Math.floor((r - 1) * cellH)"
        />
      </g>

      <rect
        v-if="currentCol !== null"
        :x="currentCol * cellW"
        y="0"
        :width="cellW"
        :height="height"
        fill="rgba(255,255,255,0.2)"
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
          i === 0 ? 'fill-green-500' : i === 1 ? 'fill-red-500' : 'fill-yellow-500'
        ]"
        @mousedown="emit('drag-start', i, $event)"
        @touchstart.prevent="emit('drag-start', i, $event)"
      />
    </svg>
  </div>
</template>

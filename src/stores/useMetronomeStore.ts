import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import type { MetronomeConfig, MetronomePreset, TempoPoint } from '../assets/types'

export const useMetronomeStore = defineStore('metronome', () => {
  // 1. State
  const dragging = ref<number | null>(null)

  const config = reactive<MetronomeConfig>({
    startBpm: 100,
    maxBpm: 140,
    endBpm: 115,
    stopAtEnd: true,
    barsPerCell: 1,
    tempoStep: 'cell',
    points: [
      { bar: 0, bpm: 100 },
      { bar: 8, bpm: 140 },
      { bar: 12, bpm: 115 }
    ]
  })

  const temposColumnWidth = ref(25)
  const metronomeSectionPadding = ref(16)

  const isRunning = ref(false)
  const rows = 37 // Total number of 5-BPM steps from 40 to 220

  // 2. Load initial data from localStorage
  const saved = window.localStorage.getItem('metronomeConfig')
  if (saved) {
    try {
      Object.assign(config, JSON.parse(saved))
    } catch (e) {
      console.error('Failed to parse saved metronome config', e)
    }
  }

  // 3. Mathematical Helpers
  const bpmToRow = (bpm: number) => Math.round(rows - (bpm - 40) / 5)
  const rowToBpm = (row: number) => 40 + (rows - row) * 5

  // 4. Actions

  function updatePoints(p: [TempoPoint, TempoPoint, TempoPoint]) {
    config.points = p
    config.startBpm = p[0].bpm
    config.maxBpm = p[1].bpm
    config.endBpm = p[2].bpm
  }

  function loadPreset(p: MetronomePreset | MetronomeConfig) {
    if (!p) return

    if (p.points) {
      config.points = JSON.parse(JSON.stringify(p.points))
    }

    config.startBpm = p.startBpm
    config.maxBpm = p.maxBpm
    config.endBpm = p.endBpm
    config.stopAtEnd = p.stopAtEnd
    config.barsPerCell = p.barsPerCell
    config.tempoStep = p.tempoStep || 'cell'
  }

  // 5. Watchers
  // Sync BPM changes (from buttons/inputs) to the points array
  watch(
    [() => config.startBpm, () => config.maxBpm, () => config.endBpm],
    ([s, m, e]) => {
      config.points[0].bpm = s
      config.points[1].bpm = m
      config.points[2].bpm = e
    }
  )

  // Getters
  const gridPoints = computed(() =>
    config.points.map(p => ({
      col: p.bar,
      row: bpmToRow(p.bpm)
    }))
  )

  return {
    dragging,
    config,
    isRunning,
    temposColumnWidth,
    rows,
    metronomeSectionPadding,
    gridPoints, // Add this
    updatePoints,
    loadPreset,
    bpmToRow,
    rowToBpm
  }
})

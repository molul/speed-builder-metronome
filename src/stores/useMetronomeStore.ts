import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import type {
  MetronomeConfig,
  MetronomePreset,
  TempoPoint,
  TempoStep
} from '../assets/types'

export type BeatType = 'high' | 'low' | 'mute'

export const useMetronomeStore = defineStore('metronome', () => {
  const isRunning = ref(false)
  const currentBar = ref(0)
  const visualBar = ref(0)
  const currentBpm = ref(0)
  const beatInBar = ref(0)

  const dragging = ref<number | null>(null)

  const defaultConfig = {
    startBpm: 100,
    peakBpm: 160,
    endBpm: 130,
    stopAtEnd: false,
    barsPerCell: 2,
    beatsPerBar: 4,
    beatPattern: ['high', 'low', 'low', 'low'] as BeatType[], // New property
    tempoStep: 'bar' as TempoStep,
    points: [
      { bar: 1, bpm: 100 },
      { bar: 8, bpm: 160 },
      { bar: 12, bpm: 130 }
    ] as [TempoPoint, TempoPoint, TempoPoint]
  }

  const config = reactive<MetronomeConfig>(defaultConfig)

  const temposColumnWidth = ref(26)
  const metronomeSectionPadding = ref(16)

  const rows = 37 // Total number of 5-BPM steps from 40 to 225

  const saved = window.localStorage.getItem('metronomeConfig')
  if (saved) {
    try {
      Object.assign(config, JSON.parse(saved))
    } catch (e) {
      console.error('Failed to parse saved metronome config', e)
    }
  }

  const bpmToRow = (bpm: number) => Math.round(rows - (bpm - 40) / 5)
  const rowToBpm = (row: number) => 40 + (rows - row) * 5

  function updatePoints(p: [TempoPoint, TempoPoint, TempoPoint]) {
    config.points = p
    config.startBpm = p[0].bpm
    config.peakBpm = p[1].bpm
    config.endBpm = p[2].bpm
  }

  function loadPreset(p: MetronomePreset | MetronomeConfig) {
    if (!p) return

    if (p.points) {
      config.points = JSON.parse(JSON.stringify(p.points))
    }

    config.startBpm = p.startBpm
    config.peakBpm = p.peakBpm
    config.endBpm = p.endBpm
    config.stopAtEnd = p.stopAtEnd
    config.barsPerCell = p.barsPerCell
    config.beatsPerBar = p.beatsPerBar || 4
    config.tempoStep = p.tempoStep || 'cell'

    // FIX: Deep copy if it exists, otherwise generate new
    if (p.beatPattern) {
      config.beatPattern = JSON.parse(JSON.stringify(p.beatPattern))
    } else {
      config.beatPattern = Array(config.beatsPerBar)
        .fill('low')
        .map((_, i) => (i === 0 ? 'high' : 'low'))
    }
  }

  function toggleBeat(index: number) {
    const cycle: BeatType[] = ['high', 'low', 'mute']

    // 1. Grab the current value, ensuring it's not undefined
    const current = config.beatPattern[index]
    if (!current) return // Safety guard

    // 2. Find the next value in the cycle
    const currentIndex = cycle.indexOf(current)
    const next = cycle[(currentIndex + 1) % cycle.length]

    // 3. Cast 'next' to BeatType or use a fallback
    if (next) {
      config.beatPattern[index] = next
    }
  }

  function reset() {
    config.startBpm = 100
    config.peakBpm = 160
    config.endBpm = 130
    config.stopAtEnd = false
    config.barsPerCell = 2
    config.beatsPerBar = 4
    config.tempoStep = 'bar'
    config.points = [
      { bar: 1, bpm: 100 },
      { bar: 8, bpm: 160 },
      { bar: 12, bpm: 130 }
    ]

    config.beatPattern = Array(config.beatsPerBar)
      .fill('low')
      .map((_, i) => (i === 0 ? 'high' : 'low'))
  }

  // Sync BPM changes (from buttons/inputs) to the points array
  watch(
    [() => config.startBpm, () => config.peakBpm, () => config.endBpm],
    ([s, m, e]) => {
      config.points[0].bpm = s
      config.points[1].bpm = m
      config.points[2].bpm = e
    }
  )

  const gridPoints = computed(() =>
    config.points.map(p => ({
      col: p.bar,
      row: bpmToRow(p.bpm)
    }))
  )

  watch(
    () => config.beatsPerBar,
    newCount => {
      while (config.beatPattern.length < newCount) {
        config.beatPattern.push('low')
      }
      if (config.beatPattern.length > newCount) {
        config.beatPattern = config.beatPattern.slice(0, newCount)
      }
    }
  )

  return {
    dragging,
    beatInBar,
    config,
    isRunning,
    currentBar,
    visualBar,
    currentBpm,
    temposColumnWidth,
    rows,
    metronomeSectionPadding,
    gridPoints,
    updatePoints,
    reset,
    toggleBeat,
    loadPreset,
    bpmToRow,
    rowToBpm
  }
})

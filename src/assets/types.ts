export type TempoStep = 'bar' | 'cell'

export interface TempoPoint {
  bar: number
  bpm: number
}

export interface MetronomeConfig {
  startBpm: number
  peakBpm: number
  endBpm: number
  stopAtEnd: boolean
  barsPerCell: number
  beatsPerBar: number
  tempoStep: TempoStep // New Property
  points: [TempoPoint, TempoPoint, TempoPoint]
}

export interface MetronomePreset extends MetronomeConfig {
  name: string
}

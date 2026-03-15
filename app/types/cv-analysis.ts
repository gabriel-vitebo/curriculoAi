export interface SectionScore {
  label: string
  score: number
  color: string
}

export interface AnalysisSummary {
  overallScore: number
  distribution: Array<{ label: string, value: number, color: string }>
  sectionScores: SectionScore[]
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  rewrittenSummary: string
  interviewTips: string[]
}

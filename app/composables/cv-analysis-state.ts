import type { CvAnalysisResult } from '~/types/cv-analysis'

export function useSelectedCvFile() {
  return useState<File | null>('selected-cv-file', () => null)
}

export function useCvAnalysisResult() {
  return useState<CvAnalysisResult | null>('cv-analysis-result', () => null)
}

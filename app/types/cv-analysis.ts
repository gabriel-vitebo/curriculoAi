export type SeniorityLevel =
  | 'estagio'
  | 'junior'
  | 'pleno'
  | 'senior'
  | 'especialista'
  | 'indefinido'

export interface CvSectionScore {
  label: string
  score: number
  color: string
}

export interface CvDistributionItem {
  label: string
  value: number
  color: string
}

export interface CvAnalysisResult {
  areaAlvo: string
  resumoProfissional: string
  resumoOtimizado: string
  pontosFortes: string[]
  pontosFracos: string[]
  habilidadesIdentificadas: string[]
  senioridadeEstimada: SeniorityLevel
  notaGeral: number
  avaliacaoPorSecao: CvSectionScore[]
  distribuicaoQualidade: CvDistributionItem[]
  sugestoesMelhoria: string[]
  dicasEntrevista: string[]
  observacoesAusentes: string[]
  avisoAutomacao: string
}

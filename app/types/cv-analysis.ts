export type SeniorityLevel =
  | 'estagio'
  | 'junior'
  | 'pleno'
  | 'senior'
  | 'especialista'
  | 'indefinido'

export interface CvAnalysisResult {
  resumoProfissional: string
  pontosFortes: string[]
  pontosFracos: string[]
  habilidadesIdentificadas: string[]
  senioridadeEstimada: SeniorityLevel
  notaGeral: number
  sugestoesMelhoria: string[]
  observacoesAusentes: string[]
  avisoAutomacao: string
}

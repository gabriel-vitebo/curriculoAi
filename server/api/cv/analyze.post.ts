import { createHash } from 'node:crypto'
import { createError, getRequestIP, readMultipartFormData } from 'h3'
import { PDFParse } from 'pdf-parse'
import type { CvAnalysisResult, CvDistributionItem, CvSectionScore, SeniorityLevel } from '~/types/cv-analysis'

type OpenAIResponse = {
  output_text?: string
  output?: Array<{
    type?: string
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
}

type CachedAnalysis = {
  createdAt: number
  result: CvAnalysisResult
}

const CACHE_KEY = '__cvAnalyzeCache'

function getCacheStore() {
  const globalScope = globalThis as typeof globalThis & {
    [CACHE_KEY]?: Map<string, CachedAnalysis>
  }

  if (!globalScope[CACHE_KEY]) {
    globalScope[CACHE_KEY] = new Map<string, CachedAnalysis>()
  }

  return globalScope[CACHE_KEY]
}

function toFriendlyError(statusCode: number, message: string) {
  return createError({
    statusCode,
    statusMessage: message,
  })
}

function safeParseJson(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  return JSON.parse(cleaned) as Record<string, unknown>
}

function getResponseText(response: OpenAIResponse) {
  if (response.output_text?.trim()) {
    return response.output_text
  }

  const textParts =
    response.output
      ?.flatMap((item) => item.content || [])
      .filter((contentItem) => contentItem.type === 'output_text' && typeof contentItem.text === 'string')
      .map((contentItem) => contentItem.text?.trim() || '')
      .filter(Boolean) || []

  return textParts.join('\n').trim()
}

function normalizeTextList(value: unknown, fallback: string, maxItems = 6) {
  if (!Array.isArray(value)) {
    return [fallback]
  }

  const normalized = value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, maxItems)

  return normalized.length > 0 ? normalized : [fallback]
}

function normalizeDesiredArea(value: unknown) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 120)
}

function normalizeSeniority(value: unknown): SeniorityLevel {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  if (normalized === 'estagio') {
    return 'estagio'
  }
  if (normalized === 'junior') {
    return 'junior'
  }
  if (normalized === 'pleno') {
    return 'pleno'
  }
  if (normalized === 'senior') {
    return 'senior'
  }
  if (normalized === 'especialista') {
    return 'especialista'
  }

  return 'indefinido'
}

function clampScore(value: unknown) {
  const asNumber = Number(value)

  if (Number.isNaN(asNumber)) {
    return 0
  }

  return Math.max(0, Math.min(10, Number(asNumber.toFixed(1))))
}

function normalizeSectionScores(value: unknown, notaGeral: number): CvSectionScore[] {
  const fallbackSections: CvSectionScore[] = [
    { label: 'Profissional', score: notaGeral || 6, color: '#8bb8e8' },
    { label: 'Experiencias', score: notaGeral || 6, color: '#9ec5ee' },
    { label: 'Competencias', score: notaGeral || 6, color: '#7faad9' },
    { label: 'Formacao', score: notaGeral || 6, color: '#b7c8d9' },
    { label: 'Clareza escrita', score: notaGeral || 6, color: '#a7b8c8' },
  ]

  if (!Array.isArray(value)) {
    return fallbackSections
  }

  const colorByIndex = ['#8bb8e8', '#9ec5ee', '#7faad9', '#b7c8d9', '#a7b8c8']

  const normalized = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const section = item as { label?: unknown, score?: unknown }
      const label = String(section.label || '').trim()

      if (!label) {
        return null
      }

      return {
        label,
        score: clampScore(section.score),
        color: colorByIndex[index] || colorByIndex[colorByIndex.length - 1],
      }
    })
    .filter((item): item is CvSectionScore => Boolean(item))
    .slice(0, 5)

  return normalized.length > 0 ? normalized : fallbackSections
}

function buildQualityDistribution(sectionScores: CvSectionScore[]): CvDistributionItem[] {
  const total = sectionScores.length || 1
  const buckets = [
    {
      label: 'Bem estruturado',
      count: sectionScores.filter((item) => item.score >= 8).length,
      color: '#b9d4a3',
    },
    {
      label: 'Aceitavel',
      count: sectionScores.filter((item) => item.score >= 6 && item.score < 8).length,
      color: '#9bbbd5',
    },
    {
      label: 'Precisa de revisao',
      count: sectionScores.filter((item) => item.score < 6).length,
      color: '#e8c488',
    },
  ]

  let consumed = 0

  return buckets.map((bucket, index) => {
    const value =
      index === buckets.length - 1
        ? Math.max(0, 100 - consumed)
        : Math.round((bucket.count / total) * 100)

    consumed += value

    return {
      label: bucket.label,
      value,
      color: bucket.color,
    }
  })
}

function normalizeAnalysis(raw: Record<string, unknown>, desiredArea: string): CvAnalysisResult {
  const notaGeral = clampScore(raw.notaGeral)
  const avaliacaoPorSecao = normalizeSectionScores(raw.avaliacaoPorSecao, notaGeral)

  return {
    areaAlvo: normalizeDesiredArea(raw.areaAlvo) || desiredArea,
    resumoProfissional: String(raw.resumoProfissional || '').trim() || 'Resumo nao identificado no curriculo.',
    resumoOtimizado:
      String(raw.resumoOtimizado || '').trim() || 'Resumo otimizado indisponivel. Revise clareza, impacto e palavras-chave.',
    pontosFortes: normalizeTextList(raw.pontosFortes, 'Nao foi possivel identificar pontos fortes com clareza.'),
    pontosFracos: normalizeTextList(raw.pontosFracos, 'Nao foi possivel identificar pontos fracos com clareza.'),
    habilidadesIdentificadas: normalizeTextList(raw.habilidadesIdentificadas, 'Nenhuma habilidade identificada.'),
    senioridadeEstimada: normalizeSeniority(raw.senioridadeEstimada),
    notaGeral,
    avaliacaoPorSecao,
    distribuicaoQualidade: buildQualityDistribution(avaliacaoPorSecao),
    sugestoesMelhoria: normalizeTextList(raw.sugestoesMelhoria, 'Revisar clareza, organizacao e completude do curriculo.'),
    dicasEntrevista: normalizeTextList(raw.dicasEntrevista, 'Prepare exemplos de resultados, desafios e tecnologias usadas.', 5),
    observacoesAusentes: normalizeTextList(raw.observacoesAusentes, 'Nao ha observacoes adicionais de ausencia de dados.', 8),
    avisoAutomacao:
      'Analise automatizada por IA. Use este resultado como apoio e valide os pontos com revisao humana.',
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const maxPdfBytes = Number(config.cvMaxPdfBytes)
  const minTextChars = Number(config.cvMinTextChars)
  const maxTextCharsToAI = Number(config.cvMaxTextCharsToAI)
  const duplicateWindowMs = Number(config.cvDuplicateWindowMs)

  if (!config.openaiApiKey) {
    throw toFriendlyError(500, 'Configuracao do servidor incompleta para analise.')
  }

  const formData = await readMultipartFormData(event)
  const filePart = formData?.find((part) => part.name === 'file')
  const desiredArea = normalizeDesiredArea(
    formData?.find((part) => part.name === 'desiredArea')?.data?.toString('utf8'),
  )

  if (!filePart?.data) {
    throw toFriendlyError(400, 'Envie um arquivo PDF para analise.')
  }

  const filename = (filePart.filename || '').toLowerCase()
  const mimeType = (filePart.type || '').toLowerCase()
  const isPdf = mimeType === 'application/pdf' || filename.endsWith('.pdf')

  if (!isPdf) {
    throw toFriendlyError(400, 'Formato invalido. Envie um curriculo em PDF.')
  }

  if (filePart.data.length > maxPdfBytes) {
    throw toFriendlyError(400, `Arquivo muito grande. Limite maximo: ${Math.floor(maxPdfBytes / (1024 * 1024))} MB.`)
  }

  let extractedText = ''

  try {
    const parser = new PDFParse({ data: filePart.data })
    const parsed = await parser.getText()
    await parser.destroy()
    extractedText = String(parsed.text || '')
      .split('\u0000')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  } catch (error) {
    console.error('Falha ao extrair texto do PDF:', error)
    throw toFriendlyError(400, 'Nao foi possivel ler o conteudo do curriculo. Verifique o arquivo e tente novamente.')
  }

  if (!extractedText) {
    throw toFriendlyError(400, 'Nao foi possivel ler o conteudo do curriculo. Verifique o arquivo e tente novamente.')
  }

  if (extractedText.length < minTextChars) {
    throw toFriendlyError(400, 'O curriculo possui pouco conteudo para analise. Adicione mais informacoes e tente novamente.')
  }

  const fileHash = createHash('sha256').update(filePart.data).digest('hex')
  const areaHash = createHash('sha256').update(desiredArea || '__general__').digest('hex')
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  const dedupeKey = `${ip}:${fileHash}:${areaHash}`
  const cacheStore = getCacheStore()
  const cached = cacheStore.get(dedupeKey)
  const now = Date.now()

  if (cached && now - cached.createdAt <= duplicateWindowMs) {
    return {
      analysis: cached.result,
      cached: true,
    }
  }

  const textForAI = extractedText.slice(0, maxTextCharsToAI)

  const prompt = [
    'Voce e um avaliador de curriculos.',
    'Analise somente o texto informado. Nao invente dados que nao estejam no curriculo.',
    'Quando faltar informacao (idiomas, certificacoes etc.), registre em observacoesAusentes.',
    'Seja objetivo: textos curtos e acionaveis.',
    desiredArea
      ? `Considere que a vaga ou objetivo principal do usuario e atuar na area: ${desiredArea}.`
      : 'Considere uma analise geral de qualidade do curriculo, sem area alvo especifica.',
    desiredArea
      ? 'A nota geral deve refletir fortemente a aderencia do curriculo a essa area. Se o curriculo estiver bem escrito, mas pouco alinhado com a area desejada, a nota deve cair.'
      : 'A nota geral deve refletir clareza, organizacao, impacto e completude do curriculo.',
    'Regras adicionais:',
    '- Pontos fortes/fracos/sugestoes: no maximo 5 itens cada.',
    '- Habilidades: no maximo 10 itens.',
    '- Gere um resumoOtimizado com ate 600 caracteres, pronto para reaproveitar no curriculo.',
    '- Gere dicasEntrevista com no maximo 4 itens, objetivas e baseadas no perfil identificado.',
    '- Nota geral com 1 casa decimal.',
    '- Gere avaliacaoPorSecao com exatamente 5 itens: Profissional, Experiencias, Competencias, Formacao e Clareza escrita.',
    '- Cada item de avaliacaoPorSecao deve ter label e score de 0 a 10.',
    '- Linguagem simples em portugues do Brasil.',
    desiredArea
      ? '- Em pontosFracos, sugestoesMelhoria e observacoesAusentes, destaque lacunas relevantes para a area desejada quando fizer sentido.'
      : '- Em pontosFracos, sugestoesMelhoria e observacoesAusentes, destaque lacunas gerais do curriculo.',
    '',
    'Texto do curriculo para analise:',
    textForAI,
  ].join('\n')

  let parsedResult: Record<string, unknown>

  try {
    const response = await $fetch<OpenAIResponse>('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: config.openaiModel,
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'cv_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                areaAlvo: {
                  type: 'string',
                },
                resumoProfissional: {
                  type: 'string',
                },
                resumoOtimizado: {
                  type: 'string',
                },
                pontosFortes: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  maxItems: 5,
                },
                pontosFracos: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  maxItems: 5,
                },
                habilidadesIdentificadas: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  maxItems: 10,
                },
                senioridadeEstimada: {
                  type: 'string',
                  enum: ['estagio', 'junior', 'pleno', 'senior', 'especialista', 'indefinido'],
                },
                notaGeral: {
                  type: 'number',
                  minimum: 0,
                  maximum: 10,
                },
                avaliacaoPorSecao: {
                  type: 'array',
                  minItems: 5,
                  maxItems: 5,
                  items: {
                    type: 'object',
                    properties: {
                      label: {
                        type: 'string',
                      },
                      score: {
                        type: 'number',
                        minimum: 0,
                        maximum: 10,
                      },
                    },
                    required: ['label', 'score'],
                    additionalProperties: false,
                  },
                },
                sugestoesMelhoria: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  maxItems: 5,
                },
                dicasEntrevista: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  maxItems: 4,
                },
                observacoesAusentes: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  maxItems: 8,
                },
              },
              required: [
                'resumoProfissional',
                'resumoOtimizado',
                'pontosFortes',
                'pontosFracos',
                'habilidadesIdentificadas',
                'senioridadeEstimada',
                'notaGeral',
                'avaliacaoPorSecao',
                'sugestoesMelhoria',
                'dicasEntrevista',
                'observacoesAusentes',
                'areaAlvo',
              ],
              additionalProperties: false,
            },
          },
        },
      },
    })

    const responseText = getResponseText(response)

    if (!responseText) {
      console.error('Resposta da OpenAI sem texto utilizavel:', response)
      throw new Error('Resposta vazia da OpenAI.')
    }

    parsedResult = safeParseJson(responseText)
  } catch (error) {
    console.error('Falha ao analisar curriculo com OpenAI:', error)
    throw toFriendlyError(502, 'Nao foi possivel analisar o curriculo neste momento. Tente novamente mais tarde.')
  }

  const normalizedAnalysis = normalizeAnalysis(parsedResult, desiredArea)

  cacheStore.set(dedupeKey, {
    createdAt: now,
    result: normalizedAnalysis,
  })

  return {
    analysis: normalizedAnalysis,
    cached: false,
  }
})

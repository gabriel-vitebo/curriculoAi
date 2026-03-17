import { createHash } from 'node:crypto'
import { createError, getRequestIP, readMultipartFormData } from 'h3'
import pdfParse from 'pdf-parse'
import type { CvAnalysisResult, SeniorityLevel } from '~/types/cv-analysis'

type OpenAIResponse = {
  output_text?: string
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

function normalizeAnalysis(raw: Record<string, unknown>): CvAnalysisResult {
  return {
    resumoProfissional: String(raw.resumoProfissional || '').trim() || 'Resumo nao identificado no curriculo.',
    pontosFortes: normalizeTextList(raw.pontosFortes, 'Nao foi possivel identificar pontos fortes com clareza.'),
    pontosFracos: normalizeTextList(raw.pontosFracos, 'Nao foi possivel identificar pontos fracos com clareza.'),
    habilidadesIdentificadas: normalizeTextList(raw.habilidadesIdentificadas, 'Nenhuma habilidade identificada.'),
    senioridadeEstimada: normalizeSeniority(raw.senioridadeEstimada),
    notaGeral: clampScore(raw.notaGeral),
    sugestoesMelhoria: normalizeTextList(raw.sugestoesMelhoria, 'Revisar clareza, organizacao e completude do curriculo.'),
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
    const parsed = await pdfParse(filePart.data)
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

  const hash = createHash('sha256').update(filePart.data).digest('hex')
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  const dedupeKey = `${ip}:${hash}`
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
    'Retorne APENAS JSON valido sem markdown e sem texto fora do JSON.',
    'Formato obrigatorio do JSON:',
    '{',
    '  "resumoProfissional": "string",',
    '  "pontosFortes": ["string"],',
    '  "pontosFracos": ["string"],',
    '  "habilidadesIdentificadas": ["string"],',
    '  "senioridadeEstimada": "estagio|junior|pleno|senior|especialista|indefinido",',
    '  "notaGeral": 0-10,',
    '  "sugestoesMelhoria": ["string"],',
    '  "observacoesAusentes": ["string"]',
    '}',
    'Regras adicionais:',
    '- Pontos fortes/fracos/sugestoes: no maximo 5 itens cada.',
    '- Habilidades: no maximo 10 itens.',
    '- Nota geral com 1 casa decimal.',
    '- Linguagem simples em portugues do Brasil.',
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
      },
    })

    parsedResult = safeParseJson(String(response.output_text || ''))
  } catch (error) {
    console.error('Falha ao analisar curriculo com OpenAI:', error)
    throw toFriendlyError(502, 'Nao foi possivel analisar o curriculo neste momento. Tente novamente mais tarde.')
  }

  const normalizedAnalysis = normalizeAnalysis(parsedResult)

  cacheStore.set(dedupeKey, {
    createdAt: now,
    result: normalizedAnalysis,
  })

  return {
    analysis: normalizedAnalysis,
    cached: false,
  }
})

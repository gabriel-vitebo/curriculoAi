<template>
  <main class="mx-auto my-6 w-[min(1120px,calc(100%-32px))] border-2 border-ink bg-panel shadow-panel backdrop-blur-[14px] max-md:my-2 max-md:w-[min(100%,calc(100%-16px))]">
    <AppHeader />

    <section class="grid gap-7 px-7 py-10 max-md:px-[18px]">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <NuxtLink to="/" class="text-[1.1rem] font-semibold">
          &lt; Importar outro curriculo
        </NuxtLink>
        <div class="flex flex-wrap justify-end gap-2">
          <span class="inline-flex items-center gap-[10px] border border-ink bg-chip px-[14px] py-[6px] text-[0.76rem] uppercase tracking-[0.14em]">{{ route.query.file || 'Resultado da analise' }}</span>
          <span
            v-if="analysisAreaLabel"
            class="inline-flex items-center gap-[10px] border border-ink bg-chip px-[14px] py-[6px] text-[0.76rem] uppercase tracking-[0.14em]"
          >
            Area: {{ analysisAreaLabel }}
          </span>
        </div>
      </div>

      <section v-if="isLoading" class="border-2 border-ink bg-surface p-6">
        <p class="text-lg font-semibold">Analisando curriculo...</p>
        <p class="mt-2 text-muted-ink">Estamos validando o PDF e gerando seu relatorio com IA.</p>
      </section>

      <section v-else-if="errorMessage" class="border-2 border-ink bg-surface p-6">
        <p class="text-lg font-semibold text-red-700">Nao foi possivel concluir a analise</p>
        <p class="mt-2">{{ errorMessage }}</p>
        <NuxtLink to="/" class="mt-4 inline-flex border border-ink bg-chip px-4 py-2 text-sm uppercase tracking-[0.08em]">
          Tentar novamente
        </NuxtLink>
      </section>

      <template v-else-if="analysis">
        <section class="grid gap-[18px]">
          <article class="border-2 border-ink bg-surface p-6">
            <div class="grid gap-8 min-[961px]:grid-cols-[1.05fr_1.2fr_180px]">
              <div class="grid gap-4">
                <ResultDonutChart :sections="analysis.distribuicaoQualidade" />
                <div class="grid gap-2 text-[1rem]">
                  <div v-for="item in analysis.distribuicaoQualidade" :key="item.label" class="flex items-center gap-3">
                    <span class="inline-block h-4 w-4 rounded-full" :style="{ background: item.color }"></span>
                    <span><strong>{{ item.value }}%</strong> {{ item.label }}</span>
                  </div>
                </div>
              </div>

              <div class="grid gap-4">
                <ResultSectionBars :items="analysis.avaliacaoPorSecao" />
                <p class="text-sm text-muted-ink">Senioridade estimada: <span class="capitalize">{{ analysis.senioridadeEstimada }}</span></p>
              </div>

              <div class="flex items-start justify-center min-[961px]:justify-end">
                <div class="flex h-[170px] w-[170px] flex-col items-center justify-center rounded-full border-2 border-ink bg-card text-center">
                  <p class="text-[0.95rem] uppercase tracking-[0.12em] text-muted-ink">Nota</p>
                  <strong class="text-[3.6rem] leading-none">{{ analysis.notaGeral }}</strong>
                  <span class="text-[1.4rem]">/10</span>
                </div>
              </div>
            </div>
          </article>

          <article class="border-2 border-ink bg-surface p-6">
            <header class="border-b-2 border-ink pb-3">
              <h3 class="m-0 text-[1.5rem]">Resumo profissional</h3>
              <p v-if="analysis.areaAlvo" class="mt-2 text-sm text-muted-ink">
                Avaliacao orientada para a area <strong>{{ analysis.areaAlvo }}</strong>.
              </p>
            </header>
            <p class="mt-4">{{ analysis.resumoProfissional }}</p>
          </article>

          <section class="grid gap-[18px] min-[861px]:grid-cols-3">
            <InsightCard title="Pontos Fortes" :items="analysis.pontosFortes" />
            <InsightCard title="Pontos Fracos" :items="analysis.pontosFracos" />
            <InsightCard title="Sugestoes de Melhoria" :items="analysis.sugestoesMelhoria" />
          </section>

          <section class="grid gap-[18px] min-[861px]:grid-cols-2">
            <article class="border-2 border-ink bg-surface p-6">
              <header class="border-b-2 border-ink pb-3">
                <h3 class="m-0 text-[1.5rem]">Melhoria no resumo</h3>
              </header>
              <div class="mt-4 border border-dashed border-subtle-ink p-4">
                <p>{{ analysis.resumoOtimizado }}</p>
              </div>
            </article>

            <article class="border-2 border-ink bg-surface p-6">
              <header class="border-b-2 border-ink pb-3">
                <h3 class="m-0 text-[1.5rem]">Dicas para entrevista</h3>
              </header>
              <ul class="m-0 mt-4 grid gap-2 pl-5">
                <li v-for="item in analysis.dicasEntrevista" :key="item">{{ item }}</li>
              </ul>
            </article>
          </section>

          <article class="border-2 border-ink bg-surface p-6">
            <header class="border-b-2 border-ink pb-3">
              <h3 class="m-0 text-[1.5rem]">Habilidades identificadas</h3>
            </header>
            <ul class="m-0 mt-4 grid gap-2 pl-5">
              <li v-for="item in analysis.habilidadesIdentificadas" :key="item">{{ item }}</li>
            </ul>
          </article>

          <article class="border-2 border-ink bg-surface p-6">
            <header class="border-b-2 border-ink pb-3">
              <h3 class="m-0 text-[1.5rem]">Informacoes ausentes ou nao identificadas</h3>
            </header>
            <ul class="m-0 mt-4 grid gap-2 pl-5">
              <li v-for="item in analysis.observacoesAusentes" :key="item">{{ item }}</li>
            </ul>
          </article>

          <article class="border-2 border-ink bg-surface p-6">
            <p class="text-sm text-muted-ink">{{ analysis.avisoAutomacao }}</p>
          </article>
        </section>

        <div class="flex flex-wrap justify-center gap-4">
          <button
            class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-button-neutral bg-button-neutral-hover px-[18px] text-ink transition-[transform,background-color] duration-150 hover:-translate-y-px"
            type="button"
            @click="copyReport"
          >
            {{ copyButtonLabel }}
          </button>
          <button
            class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-button-positive bg-button-positive-hover px-[18px] text-ink transition-[transform,background-color] duration-150 hover:-translate-y-px"
            type="button"
            @click="downloadReport"
          >
            Baixar relatorio
          </button>
        </div>
      </template>
    </section>

    <AppFooter />
  </main>
</template>

<script setup lang="ts">
import type { CvAnalysisResult } from '~/types/cv-analysis'

const route = useRoute()
const selectedCvFile = useSelectedCvFile()
const selectedCvArea = useSelectedCvArea()
const cvAnalysisResult = useCvAnalysisResult()

const analysis = computed(() => cvAnalysisResult.value)
const analysisAreaLabel = computed(() => analysis.value?.areaAlvo || selectedCvArea.value || String(route.query.area || '').trim())
const isLoading = ref(false)
const errorMessage = ref('')
const copyButtonLabel = ref('Copiar relatorio')

const FALLBACK_ERROR_MESSAGE = 'Nao foi possivel analisar o curriculo neste momento. Tente novamente mais tarde.'

onMounted(async () => {
  if (analysis.value) {
    return
  }

  const file = selectedCvFile.value

  if (!file) {
    errorMessage.value = 'Nenhum arquivo foi encontrado para analise. Envie o curriculo novamente.'
    return
  }

  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('desiredArea', selectedCvArea.value.trim())

    const response = await $fetch<{ analysis: CvAnalysisResult, cached: boolean }>('/api/cv/analyze', {
      method: 'POST',
      body: formData,
    })

    cvAnalysisResult.value = response.analysis
  } catch (error: unknown) {
    errorMessage.value = getFriendlyMessage(error)
  } finally {
    isLoading.value = false
  }
})

function getFriendlyMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string } }).data

    if (data?.statusMessage) {
      return data.statusMessage
    }
  }

  return FALLBACK_ERROR_MESSAGE
}

function buildReportText() {
  if (!analysis.value) {
    return ''
  }

  const lines = [
    `Area alvo: ${analysis.value.areaAlvo || 'Analise geral'}`,
    `Nota geral: ${analysis.value.notaGeral}/10`,
    `Senioridade estimada: ${analysis.value.senioridadeEstimada}`,
    '',
    'Distribuicao da avaliacao:',
    ...analysis.value.distribuicaoQualidade.map((item) => `- ${item.label}: ${item.value}%`),
    '',
    'Avaliacao por secao:',
    ...analysis.value.avaliacaoPorSecao.map((item) => `- ${item.label}: ${item.score}/10`),
    '',
    'Resumo profissional:',
    analysis.value.resumoProfissional,
    '',
    'Melhoria no resumo:',
    analysis.value.resumoOtimizado,
    '',
    'Pontos fortes:',
    ...analysis.value.pontosFortes.map((item) => `- ${item}`),
    '',
    'Pontos fracos:',
    ...analysis.value.pontosFracos.map((item) => `- ${item}`),
    '',
    'Habilidades identificadas:',
    ...analysis.value.habilidadesIdentificadas.map((item) => `- ${item}`),
    '',
    'Sugestoes de melhoria:',
    ...analysis.value.sugestoesMelhoria.map((item) => `- ${item}`),
    '',
    'Dicas para entrevista:',
    ...analysis.value.dicasEntrevista.map((item) => `- ${item}`),
    '',
    'Informacoes ausentes ou nao identificadas:',
    ...analysis.value.observacoesAusentes.map((item) => `- ${item}`),
    '',
    analysis.value.avisoAutomacao,
  ]

  return lines.join('\n')
}

async function copyReport() {
  const report = buildReportText()

  if (!report) {
    return
  }

  try {
    await navigator.clipboard.writeText(report)
    copyButtonLabel.value = 'Copiado!'
    setTimeout(() => {
      copyButtonLabel.value = 'Copiar relatorio'
    }, 1800)
  } catch {
    copyButtonLabel.value = 'Falha ao copiar'
  }
}

function downloadReport() {
  const report = buildReportText()

  if (!report) {
    return
  }

  const blob = buildPdfBlob(report)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = buildReportFilename()
  link.click()

  URL.revokeObjectURL(url)
}

function buildReportFilename() {
  const originalName = String(route.query.file || '').trim()
  const normalizedName = originalName.replace(/\.pdf$/i, '').trim()
  const baseName = normalizedName || 'curriculo-ai-relatorio'

  return `${baseName}-relatorio.pdf`
}

function buildPdfBlob(report: string) {
  const fontSize = 12
  const lineHeight = 16
  const pageWidth = 595
  const pageHeight = 842
  const marginX = 56
  const marginTop = 64
  const marginBottom = 64
  const maxCharsPerLine = 72
  const usableHeight = pageHeight - marginTop - marginBottom
  const linesPerPage = Math.max(1, Math.floor(usableHeight / lineHeight))
  const wrappedLines = wrapTextForPdf(report, maxCharsPerLine)
  const pages = chunkLines(wrappedLines, linesPerPage)
  const objects: Uint8Array[] = []
  const pageObjectIds: number[] = []
  let objectId = 1

  const catalogObjectId = objectId++
  const pagesObjectId = objectId++
  const fontObjectId = objectId++

  for (const pageLines of pages) {
    const contentStream = buildPdfContentStream(pageLines, {
      fontSize,
      lineHeight,
      pageHeight,
      marginLeft: marginX,
      marginTop,
    })
    const contentObjectId = objectId++
    const pageObjectId = objectId++

    objects[contentObjectId] = concatPdfBytes([
      encodeAscii(`<< /Length ${contentStream.length} >>\nstream\n`),
      contentStream,
      encodeAscii('\nendstream'),
    ])
    objects[pageObjectId] = encodeAscii(`<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`)
    pageObjectIds.push(pageObjectId)
  }

  objects[catalogObjectId] = encodeAscii(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`)
  objects[pagesObjectId] = encodeAscii(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`)
  objects[fontObjectId] = encodeAscii('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')

  return new Blob([serializePdfDocument(buildPdfObjectList(objects, objectId - 1))], { type: 'application/pdf' })
}

function wrapTextForPdf(text: string, maxCharsPerLine: number) {
  const normalizedText = text.replace(/\r\n/g, '\n')
  const paragraphs = normalizedText.split('\n')
  const wrappedLines: string[] = []

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()

    if (!trimmedParagraph) {
      wrappedLines.push('')
      continue
    }

    let currentLine = ''

    for (const word of trimmedParagraph.split(/\s+/)) {
      const candidate = currentLine ? `${currentLine} ${word}` : word

      if (candidate.length <= maxCharsPerLine) {
        currentLine = candidate
        continue
      }

      if (currentLine) {
        wrappedLines.push(currentLine)
      }

      currentLine = word
    }

    if (currentLine) {
      wrappedLines.push(currentLine)
    }
  }

  return wrappedLines.length ? wrappedLines : ['']
}

function chunkLines(lines: string[], linesPerPage: number) {
  const pages: string[][] = []

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage))
  }

  return pages.length ? pages : [['']]
}

function buildPdfContentStream(
  lines: string[],
  layout: {
    fontSize: number
    lineHeight: number
    pageHeight: number
    marginLeft: number
    marginTop: number
  },
) {
  const startY = layout.pageHeight - layout.marginTop
  const parts: Uint8Array[] = [
    encodeAscii('BT\n'),
    encodeAscii(`/F1 ${layout.fontSize} Tf\n`),
    encodeAscii(`${layout.lineHeight} TL\n`),
    encodeAscii(`${layout.marginLeft} ${startY} Td\n`),
  ]

  lines.forEach((line, index) => {
    if (index > 0) {
      parts.push(encodeAscii('T*\n'))
    }

    parts.push(encodeAscii('('))
    parts.push(escapePdfText(line))
    parts.push(encodeAscii(') Tj\n'))
  })

  parts.push(encodeAscii('ET'))

  return concatPdfBytes(parts)
}

function escapePdfText(value: string) {
  const escapedBytes: number[] = []

  for (const byte of encodeWinAnsi(value)) {
    if (byte === 0x5c || byte === 0x28 || byte === 0x29) {
      escapedBytes.push(0x5c)
    }

    escapedBytes.push(byte)
  }

  return new Uint8Array(escapedBytes)
}

function buildPdfObjectList(objects: Uint8Array[], lastObjectId: number) {
  const objectList: Uint8Array[] = [new Uint8Array()]

  for (let index = 1; index <= lastObjectId; index += 1) {
    const objectBytes = objects[index]

    if (!objectBytes) {
      throw new Error(`PDF object ${index} was not created.`)
    }

    objectList.push(objectBytes)
  }

  return objectList
}

function serializePdfDocument(objects: Uint8Array[]) {
  const header = encodeAscii('%PDF-1.4\n')
  const parts: Uint8Array[] = [header]
  const offsets: number[] = []
  let currentOffset = header.length

  objects.slice(1).forEach((objectBytes, objectIndex) => {
    const index = objectIndex + 1
    offsets[index] = currentOffset

    const serializedObject = concatPdfBytes([
      encodeAscii(`${index} 0 obj\n`),
      objectBytes,
      encodeAscii('\nendobj\n'),
    ])

    parts.push(serializedObject)
    currentOffset += serializedObject.length
  })

  const xrefOffset = currentOffset
  let xref = `xref\n0 ${objects.length}\n`
  xref += '0000000000 65535 f \n'

  for (let index = 1; index < objects.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }

  xref += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  parts.push(encodeAscii(xref))

  return concatPdfBytes(parts)
}

function concatPdfBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }

  return result
}

function encodeAscii(value: string) {
  return new TextEncoder().encode(value)
}

function encodeWinAnsi(value: string) {
  const bytes: number[] = []

  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0x3f

    if ((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xa0 && codePoint <= 0xff)) {
      bytes.push(codePoint)
      continue
    }

    const mappedByte = WIN_ANSI_MAP[char]
    bytes.push(mappedByte ?? 0x3f)
  }

  return new Uint8Array(bytes)
}

const WIN_ANSI_MAP: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  'ƒ': 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  'ˆ': 0x88,
  '‰': 0x89,
  'Š': 0x8a,
  '‹': 0x8b,
  'Œ': 0x8c,
  'Ž': 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  'š': 0x9a,
  '›': 0x9b,
  'œ': 0x9c,
  'ž': 0x9e,
  'Ÿ': 0x9f,
}
</script>

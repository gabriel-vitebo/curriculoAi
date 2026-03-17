import { createError, readBody } from 'h3'

type AnalyzeBody = {
  input?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<AnalyzeBody>(event)
  const input = body?.input?.trim()

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OPENAI_API_KEY nao configurada no servidor.',
    })
  }

  if (!input) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campo "input" obrigatorio.',
    })
  }

  const response = await $fetch<{
    output_text?: string
  }>('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: config.openaiModel,
      input,
    },
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Falha ao consultar OpenAI.'

    throw createError({
      statusCode: 502,
      statusMessage: message,
    })
  })

  return {
    model: config.openaiModel,
    outputText: response.output_text ?? '',
  }
})

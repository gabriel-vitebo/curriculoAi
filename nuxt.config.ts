import { defineNuxtConfig } from 'nuxt/config'
import { appVersion } from './config/app-version'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  app: {
    head: {
      title: 'CurriculoAI',
      meta: [
        {
          name: 'description',
          content: 'Upload de curriculo em PDF com analise e sugestoes baseadas em IA.',
        },
      ],
    },
  },

  modules: [
    ['@nuxtjs/tailwindcss', { cssPath: '~/assets/css/main.css' }],
    ['@nuxt/eslint', { checker: false }],
  ],

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    cvMaxPdfBytes: Number(process.env.CV_MAX_PDF_BYTES || 5 * 1024 * 1024),
    cvMinTextChars: Number(process.env.CV_MIN_TEXT_CHARS || 180),
    cvMaxTextCharsToAI: Number(process.env.CV_MAX_TEXT_CHARS_TO_AI || 12000),
    cvDuplicateWindowMs: Number(process.env.CV_DUPLICATE_WINDOW_MS || 120000),
    public: {
      appVersion,
    },
  },
})

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

  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
  eslint: {
    checker: false,
  },
})

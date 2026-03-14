// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
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
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Must be false to be used served by pocketbase
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/full-calendar.css'],
  modules: ['pocketbase-nuxt', '@nuxt/ui', '@nuxtjs/mdc'],
  pocketbase: {
    url: process.env.POCKETBASE_URL,  // Your PocketBase URL
  },
  nitro: {
    output: {
      //fix for nuxt dev deleting the generated output folder
      dir: process.env.NODE_ENV === "development" ? ".output-dev" : "./db/.output",
    }
  },
  app: {
    head: {
      title: "3Bein"
    }
  }
});
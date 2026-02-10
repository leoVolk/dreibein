

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Must be false to be used served by pocketbase
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['pocketbase-nuxt', '@nuxt/ui'],
  pocketbase: {
    url: 'http://127.0.0.1:8090' // Your PocketBase URL
  },
  nitro: {
    output: {
      //fix for nuxt dev deleting the generated output folder
      dir: process.env.NODE_ENV === "development" ? ".output-dev" : "./db/.output",
    }
  },
});

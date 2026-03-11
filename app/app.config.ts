export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'mauve'
    },
    container: {
      base: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8'
    },
    button: {
      slots: {
        base: 'cursor-pointer'
      }
    }
  }
});
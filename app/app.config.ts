export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc'
    },
    container: {
      base: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8'
    },
    button: {
      slots: {
        base: 'cursor-pointer'
      }
    },
    table: {
      slots: {
        root: 'max-h-[65vh]',
        th: 'text-base',
      },
      variants: {
        pinned: {
          true: {
            th: 'sticky bg-transparent',
            td: 'sticky bg-default/50 z-1 backdrop-blur-xs'
          }
        },
      }
    },
    accordion: {
      slots: {
        label: 'text-lg'
      }
    },
    pageHeader: {
      slots: {
        root: 'pb-4 pt-0'
      }
    }
  }
});
 export default {
    plugins: {
      'postcss-custom-media': {
        customMedia: {
          '--mobile-break':  '(max-width: 599px)',
          '--tablet-break':  '(min-width: 600px)',
          '--desktop-break': '(min-width: 1200px)',
        },
      },
    },
  };
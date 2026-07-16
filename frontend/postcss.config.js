  export default {
    plugins: {
      '@csstools/postcss-global-data': {
        files: ['src/theme/media_breakpoints.css'],
      },
      'postcss-custom-media': {},
    },
  };
const tailwindConfig = {
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  daisyui: {
    styled: true,
    themes: ['light', 'dark'],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: '2.75em',
            },
            // a: {
            //   color: '#3182ce',
            //   '&:hover': {
            //     color: '#2c5282',
            //   },
            // },
          },
        },
      },
    },
  },
};

module.exports = tailwindConfig;

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
            h3: {
              margin: 0,
            }
          },
        },
      },
      dropShadow: {
        'xl-primary': '0 8px 5px rgba(87, 13, 248, 0.42)',
      }
    },
  },
};

module.exports = tailwindConfig;

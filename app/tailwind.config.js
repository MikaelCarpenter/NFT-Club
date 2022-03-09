const tailwindConfig = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F36D9B',
      },
    },
  },
  plugins: [require('daisyui')],
};

module.exports = tailwindConfig;

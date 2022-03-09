const tailwindConfig = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Playfair Display Semibold']
      },
      colors: {
        'text-primary': '#374050',
        'bg-primary': '#F26C9B',
        'title': '#661181',
      },
    },
  },
  plugins: [require('daisyui')],
};

module.exports = tailwindConfig;

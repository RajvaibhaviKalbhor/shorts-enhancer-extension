module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        micpulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 102, 0.7)' },
          '70%': { boxShadow: '0 0 0 12px rgba(255, 0, 102, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 102, 0)' },
        },
      },
      animation: {
        micpulse: 'micpulse 1.5s ease-in-out infinite',
      },
      colors: {
        primary: '#ff0066',
        secondary: '#7F00FF',
      }
    },
  },
  plugins: [],
}

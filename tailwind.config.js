/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0E1117',
        card: '#161B22',
        border: 'rgba(255,255,255,0.08)',
        text: '#E6EDF3',
        'text-secondary': '#8B949E',
        green: '#2ECC71',
        orange: '#F5A623',
        red: '#E74C3C',
        blue: '#4EA1FF',
        purple: '#A855F7',
      },
      borderRadius: {
        window: '18px',
      },
      boxShadow: {
        window: '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        glow: '0 0 12px rgba(46, 204, 113, 0.45)',
        'glow-orange': '0 0 12px rgba(245, 166, 35, 0.35)',
      },
      animation: {
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.92)' },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

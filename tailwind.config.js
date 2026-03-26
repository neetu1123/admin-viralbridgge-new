/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4E40F1',
          light: '#6C60F5',
          dark: '#3B2FD9',
          50: '#EEF2FF',
          100: '#E3EDFC',
        },
        cta: {
          DEFAULT: '#F22A57',
          hover: '#D61F48',
        },
        bg: {
          base: '#F8FAFF',
          alt: '#EEF2FF',
          accent: '#E3EDFC',
        },
        heading: '#111827',
        sub: '#6B7280',
        muted: '#9CA3AF',
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'md': '0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        'lg': '0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'primary': '0 8px 24px rgba(78,64,241,0.18)',
        'cta': '0 4px 14px rgba(242,42,87,0.28)',
      },
      maxWidth: {
        'container': '1280px',
      },
      animation: {
        'clip-in': 'clipIn 0.9s cubic-bezier(0.25, 1, 0.5, 1) both',
        'fade-up': 'fadeUp 0.7s ease-out both',
        'float': 'floatUp 4s ease-in-out infinite',
        'live-pulse': 'livePulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        clipIn: {
          '0%': { opacity: '0', clipPath: 'inset(0 0 100% 0)' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0% 0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatUp: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
      },
    },
  },
  plugins: [],
};
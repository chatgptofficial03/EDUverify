import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        oxford: {
          50: '#f4f6fa',
          100: '#e5eaf3',
          200: '#cfd8e8',
          300: '#abbdd7',
          400: '#809dc2',
          500: '#5f80ad',
          600: '#486694',
          700: '#3a5177',
          800: '#324463',
          850: '#23324b',
          900: '#141d2d',
          950: '#0a0f18',
        },
        gold: {
          50: '#fbf9f1',
          100: '#f6f0dd',
          200: '#ede0bb',
          300: '#e2cb92',
          400: '#d5b369',
          500: '#c59b48',
          600: '#aa7e37',
          700: '#895f2d',
          800: '#714d2a',
          900: '#5d3f26',
          950: '#362111',
        },
        parchment: {
          50: '#fcfbf8',
          100: '#f8f5ee',
          200: '#f1ebd9',
          300: '#e6dcbf',
          400: '#d8c89f',
          500: '#c7b180',
        },
        brand: {
          50: '#f0f5fa',
          100: '#e2ebf4',
          200: '#c7d7e9',
          300: '#9fbcd9',
          400: '#709cc5',
          500: '#4e80b2',
          600: '#396697',
          700: '#2f527c',
          800: '#2a4567',
          900: '#1e334d',
          950: '#111d2c',
        },
        navy: {
          800: '#0f172a',
          900: '#0a0f1d',
          950: '#060a14',
        }
      },
      boxShadow: {
        '3d-sm': '0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(10,15,24,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        '3d-md': '0 4px 6px -1px rgba(0,0,0,0.08), 0 10px 20px -3px rgba(10,15,24,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
        '3d-lg': '0 10px 25px -5px rgba(0,0,0,0.15), 0 20px 40px -10px rgba(10,15,24,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
        '3d-gold': '0 8px 24px -4px rgba(197, 155, 72, 0.25), 0 2px 6px rgba(197, 155, 72, 0.15), inset 0 1px 0 rgba(255,245,215,0.8)',
        '3d-dark': '0 12px 30px -4px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        '3d-pressed': 'inset 0 3px 6px rgba(0,0,0,0.25), inset 0 1px 2px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f7e7be 0%, #c59b48 50%, #9e7529 100%)',
        'gold-foil': 'linear-gradient(110deg, #dfb76c 0%, #f9eec9 25%, #c59b48 50%, #f7e4b5 75%, #aa7e37 100%)',
        'oxford-gradient': 'linear-gradient(160deg, #101c2e 0%, #0a0f18 100%)',
        'parchment-pattern': 'radial-gradient(circle at 50% 50%, #fcfbf8 0%, #f5efe1 100%)',
      }
    },
  },
  plugins: [],
};
export default config;

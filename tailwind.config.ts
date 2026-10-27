import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe8',
          600: '#0171c6',
          700: '#025aa1',
          800: '#064d84',
          900: '#0a406e',
          950: '#072949',
        },
        navy: {
          800: '#0f172a',
          900: '#0a0f1d',
          950: '#060a14',
        }
      },
    },
  },
  plugins: [],
};
export default config;

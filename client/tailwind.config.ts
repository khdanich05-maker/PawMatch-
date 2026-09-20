import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#FCFAF8',
        primary: '#E29578',
        primaryHover: '#C07055',
        textMain: '#44403C',
        bgAccent: '#FDF0EB',
      },
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
        mali: ['Mali', 'cursive'],
        itim: ['Itim', 'cursive'],
      }
    }
  },
  plugins: [],
};
export default config;
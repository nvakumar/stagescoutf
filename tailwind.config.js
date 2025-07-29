// 1. tailwind.config.js (in your project's root)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// 2. postcss.config.js (in your project's root)
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

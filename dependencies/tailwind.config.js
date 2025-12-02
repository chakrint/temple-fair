/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",       // สแกนไฟล์ใน folder app
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // สแกนไฟล์ใน folder components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/Project1/**/*.{js,ts,jsx,tsx}", // הנתיב המדויק לקבצים שלך
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


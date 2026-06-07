/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/Project1/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(215, 65%, 73%)",
        background: "hsl(216, 81%, 64%)",
        foreground: "hsl(223, 85%, 56%)",
        primary: {
          DEFAULT: "hsl(222, 85%, 57%)",
          foreground: "hsl(18, 56%, 93%)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
}
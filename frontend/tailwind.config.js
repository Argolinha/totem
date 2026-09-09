/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vive: {
          primary: "#7C3AED",   // roxo - identidade visual Vive AI
          secondary: "#06B6D4", // ciano
          dark: "#0F0F1A",
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        fichas: ["fichas", "monospace"],
        titulo: ["titulo", "sans-serif"],
        letras: ["letras", "sans-serif"],
      },
      colors: {
        mesa: "var(--color-mesa)",
        linea: "var(--color-linea)",
        cambio: "var(--color-cambio)",
        fondo: "var(--color-fondo)",
      },
    },
  },
  plugins: [],
};

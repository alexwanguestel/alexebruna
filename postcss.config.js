// postcss.config.js - NOVO e CORRETO
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- MUDANÇA IMPORTANTE AQUI
    autoprefixer: {},
  },
}
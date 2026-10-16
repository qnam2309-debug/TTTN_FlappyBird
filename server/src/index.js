import app from './app.js'

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`)
  console.log(`Swagger: http://localhost:${PORT}/api-docs`)
})

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.js'
import scoresRouter from './routes/scores.js'
import leaderboardRouter from './routes/leaderboard.js'
import skinsRouter from './routes/skins.js'
import authRouter from './routes/auth.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRouter) // tạm, của Người 1
app.use('/api/scores', scoresRouter)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/skins', skinsRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Lỗi máy chủ' })
})

export default app

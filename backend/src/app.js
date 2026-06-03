const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const promiseRoutes = require('./routes/promises.routes')
const partyRoutes = require('./routes/parties.routes')
const regionRoutes = require('./routes/regions.routes')
const governmentRoutes = require('./routes/governments.routes')
const chatRoutes = require('./routes/chat.routes')
const adminRoutes = require('./routes/admin.routes')

const app = express()

app.use(cors())
app.use(express.json())

// Rate limiting for API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
})
app.use('/api', limiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Manifesto Tracker API is running' })
})

// Routes
app.use('/api/promises', promiseRoutes)
app.use('/api/parties', partyRoutes)
app.use('/api/regions', regionRoutes)
app.use('/api/governments', governmentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong', message: err.message })
})

module.exports = app
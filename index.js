const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blogs')
const config = require('./utils/config')

const mongoUrl = process.env.MONGODB_URI

mongoose
  .connect(mongoUrl)
  .then( () => {
    console.log('connected to database', mongoUrl)
  })
  .catch( err => {
    console.log(err)
  })


app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))
app.use(middleware.logger)
console.log('seuraavaksi router')
app.use('/api/blogs',blogRouter)

app.use(middleware.error)

const server = http.createServer(app)

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}

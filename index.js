const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blogs')

const mongoUrl = process.env.MONGODB_URI



mongoose
  .connect(mongoUrl)
  .then( () => {
    console.log('connected to database', mongoUrl)
  })
  .catch( err => {
    console.log(console.error())
  })



app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))
app.use(middleware.logger)
console.log('seuraavaksi router')
app.use('/api/blogs',blogRouter)

app.use(middleware.error)  


const PORT = 3013
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

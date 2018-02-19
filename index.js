const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')



const Blog = mongoose.model('Blog', {
  title: String,
  author: String,
  url: String,
  likes: Number
})

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id
  }
}

module.exports = Blog

app.use(cors())
app.use(bodyParser.json())

const mongoUrl ='mongodb://<username>:<passwd>@ds243008.mlab.com:43008/full-stack-blog'


mongoose.connect(mongoUrl)
//mongoose.Promise = global.Promise

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
        response.json(blogs.map(formatBlog))
        mongoose.connection.close() 
      })
     
})

app.post('/api/blogs', (request, response) => {
  const body = request.body

  console.log('body ',body)
  //console.log('request, ',request)

  if(body.title===undefined || body.author===undefined){
    return response.status(400).json({error: 'title or author missing'})
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: Number(body.likes)
  })

  blog
    .save()
    .then(result => {
      response.json(formatBlog(result))
      //response.status(201).json(result)
      mongoose.connection.close()
    })
})

const PORT = 3013
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

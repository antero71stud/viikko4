const blogRouter = require('express').Router()
const Blog = require('../models/blogs')
const formatBlog = require('../utils/blogformat')



blogRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs.map(formatBlog))
    })

})

blogRouter.get('/:id', (request, response) => {
  Blog
    .findById(request.params.id)
    .then(blog => {
      if(blog) {
        response.json(formatBlog(blog))
      }else{
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id'})
    })

})

blogRouter.post('/', (request, response) => {
  const body = request.body

  console.log('body ',body)
  //console.log('request, ',request)

  if(body.title===undefined || body.title.trim().length===0
      || body.url===undefined || body.url.trim().length===0)
  {
    return response.status(400).json({ error: 'title and url are mandatory field' })
  }

  if(body.author===undefined || body.author.trim().length===0){
    return response.status(400).json({ error: 'author missing' })
  }

  if(body.likes===undefined){
    body.likes=0
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
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: 'something went wrong...' })
    })
})

module.exports = blogRouter
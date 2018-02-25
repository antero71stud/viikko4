const blogRouter = require('express').Router()
const Blog = require('../models/blogs')
const formatBlog = require('../utils/blogformat')



blogRouter.get('/', async (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs.map(formatBlog))
    })

})

blogRouter.get('/:id', async (request, response) => {
  try{
    Blog
      .findById(request.params.id)
      .then(blog => {
        if(blog) {
          response.json(formatBlog(blog))
        }else{
          response.status(404).end()
        }
      })
  }catch(exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogRouter.post('/', async (request, response) => {
  try{
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

    const savedBlog = await blog.save()

    response.json(formatBlog(savedBlog))

  }catch(exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogRouter.delete('/:id', async (request,response) => {
  try{
    await Blog.findByIdAndRemove(request.params.id, function(err){
      if(err)
        response.status(400).send({ error: 'malformed id' })
      else
        response.status(204).json({ message: 'blog deleted' } )
    })

    response.status(204).end()
  }catch(exception){
    console.log(exception)
    response.status(400).send({ error: 'malformed id' })
  }
})

module.exports = blogRouter
const blogRouter = require('express').Router()
const Blog = require('../models/blogs')
const mongoose = require('mongoose')

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id
  }
}

blogRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs.map(formatBlog))
    })

})

blogRouter.post('/', (request, response) => {
  const body = request.body

  console.log('body ',body)
  //console.log('request, ',request)

  if(body.title===undefined || body.author===undefined){
    return response.status(400).json({ error: 'title or author missing' })
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
})

module.exports = blogRouter
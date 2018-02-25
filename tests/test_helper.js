const Blog = require('../models/blogs')
const format = require('../utils/blogformat')

const initialBlogs = [
  {
    title: 'Owasp top-10 2017',
    author: 'Andrew van der Stock',
    link: 'https://www.owasp.org/index.php/Top_10-2017_Top_10'
  }
]

const nonExistingId = async () => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(format)
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}
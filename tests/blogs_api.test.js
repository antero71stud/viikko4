const Blog = require('../models/blogs')
const supertest = require('supertest')
const { app,server } = require('../index')
const api = supertest(app)


const initialBlogs = [
  {
    title: 'Owasp top-10 2017',
    author: 'Andrew van der Stock',
    link: 'https://www.owasp.org/index.php/Top_10-2017_Top_10'
  }
]

beforeAll(async () => {
  await Blog.remove({})
  console.log('cleared')

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
  console.log('initialize done')
})

console.log('blog_api.test.js tiedostossa')

test('blogs are returned as json',async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('initial blog returned',async () => {
  const response = await api
    .get('/api/blogs')

  const titles = response.body.map( t => t.title)

  expect(titles).toContain('Owasp top-10 2017')
})

console.log('POST testin alussa')

test('new blog stored database', async () => {

  const newBlog = {
    title: 'Oma Lego -blogi',
    author: 'Antero Oikkonen',
    url: 'http://oikkonen.blogspot.fi',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type',/application\/json/)

  const response = await api
    .get('/api/blogs')

  const titles = response.body.map(r => r.title)

  expect(response.body.length).toBe(initialBlogs.length + 1)
  expect(titles).toContain('Oma Lego -blogi')
})

test('new blog without title or url', async () => {

  const newBlog = {
    author: 'Antero Oikkonen',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type',/application\/json/)
})

test('new blog empty title or url', async () => {

  const newBlog2 = {
    title: '',
    author: 'Antero Oikkonen',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog2)
    .expect(400)
    .expect('Content-Type',/application\/json/)
})

test('new blog stored database without likes, likes 0 returned', async () => {

  const newBlog = {
    title: 'Tavoitteena maraton',
    author: 'Antero Oikkonen',
    url: 'https://anteronmaraton.blogspot.fi'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type',/application\/json/)

  const response = await api
    .get('/api/blogs')

  console.log('response.body, ',response.body)


  const blog = response.body.filter(r => r.title==='Tavoitteena maraton')

  console.log('blog ',blog)
  console.log('blog.likes, ',blog[0].likes)

  expect(response.body.length).toBe(initialBlogs.length + 2)
  expect(blog[0].title).toEqual('Tavoitteena maraton')
  expect(blog[0].likes).toBe(0)
})

afterAll(() => {
  server.close()
})



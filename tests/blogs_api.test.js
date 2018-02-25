const { initialBlogs, nonExistingId, blogsInDb } = require('./test_helper.js')
const Blog = require('../models/blogs')
const supertest = require('supertest')
const { app,server } = require('../index')
const api = supertest(app)




describe('when there is initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})
    console.log('cleared')

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
    console.log('initialize done')
  })


  test('all blogs are returned as json by GET /api/blogs',async () => {

    const blogsInDatabase = await blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(b => b.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedTitles).toContain(blog.title)
    })

  })

  test('individual blog are returned as json by GET /api/blogs/:id', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]

    const response = await api.get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toEqual(aBlog.title)
  })

  test('404 returned by GET /api/notes/:id with nonexisting valid id', async () => {
    const validNonexistingId = await nonExistingId()

    await api
    .get(`/api/blogs/${validNonexistingId}`)
    .expect(404)
  })

  test('400 is returned by GET /api/blogs/:id with invalid id', async () => {
    const invalidId = '7847b2525af34c900a27bc982ddab553'

    const response = await api 
    .get(`/api/blogs/${invalidId}`)
    .expect(400)
  })

  describe('addition of a new blog', async () => {

    test('POST /api/blogs succeeds with valid data', async () => {

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

    test('POST /api/blogs fail with proper statuscode if title and url is missing', async () => {

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

    test('POST /api/blogs fail with proper statuscode if title and url is empty', async () => {

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

    test('POST /api/blogs without likes store likes value to the 0', async () => {

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
  })
})


test('initial blog returned',async () => {
  const response = await api
    .get('/api/blogs')

  const titles = response.body.map( t => t.title)

  expect(titles).toContain('Owasp top-10 2017')
})

console.log('POST testin alussa')

afterAll(() => {
  server.close()
})



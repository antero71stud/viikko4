const { initialBlogs, nonExistingId, blogsInDb, usersInDb, nonExistingUserId } = require('./test_helper.js')
const Blog = require('../models/blogs')
const User = require('../models/user')

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

  describe('deletion of a blog', async () => {

    let addedBlog

    beforeAll(async () => {
      addedBlog = new Blog({
        title: 'poistotestiin blogi',
        author: 'Antero Oikkonen',
        likes: 9,
        url: 'http://www.google.com'
      })
      await addedBlog.save()
    })

    test('DELETE /api/blogs/:id succeeds with propers statuscode', async () => {
      const blogsAtStart = await blogsInDb()

      const titlesStart = blogsAtStart.map(r => r.title)

      await console.log('titlesStart, ',titlesStart)

      console.log('addedBlog._id, ', addedBlog._id)

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfterDelete = await blogsInDb()

      const titles = blogsAfterDelete.map(b => b.title)

      await console.log('titles, ', titles)

      //expect(addedBlog.title).not.toContain(titles)
      expect(titles).not.toContain(addedBlog.title)
      expect(blogsAfterDelete.length).toBe(blogsAtStart.length-1)
    })
  })
})

describe('when there is initially one user at db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'vaikeasalasana', adult: true })
    await user.save()
  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'aoikkonen',
      name: 'Antero Oikkonen',
      adult: true,
      password: '?salainen1'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const usernames = usersAfterOperation.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fail with a short username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'ab',
      name: 'Antero Oikkonen',
      adult: true,
      password: '?salainen1'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('POST /api/users set adult correctly', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'aoikkon',
      name: 'Antero Oikkonen',
      password: '?salainen1'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/users')


    const user = response.body.filter(r => r.username==='aoikkon')
    console.log('user', user)

    expect(user[0].name).toEqual('Antero Oikkonen')
    expect(user[0].adult).toBe(true)


    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
  })

})


afterAll(() => {
  server.close()
})



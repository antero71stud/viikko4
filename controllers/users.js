const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request,response) => {
  try{
    const body = request.body

    if(body.username.length<4){
      return response.status(400).json({ error: 'username must have more than 3 letter' })
    }

    const existingUser = await User.find({ username: body.username })

    if (existingUser.length>0) {
      return response.status(400).json({ error: 'username must be unique' })
    }

    if (body.adult === undefined) {
      body.adult=true
    }

    console.log('body.adult ',body.adult)

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password,saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      adult: body.adult,
      passwordHash
    })

    const savedUser = await user.save()

    response.json(savedUser)
  }catch(exception){
    console.log(exception)
    response.status(500).json({ error: 'adding new user failed' })
  }
})

usersRouter.get('/', async (request,response) => {
  User
    .find({})
    .then(user => {
      response.json(user.map(formatUser))
    })
})

const formatUser = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    adult: user.adult,
    notes: user.notes
  }
}

module.exports = usersRouter
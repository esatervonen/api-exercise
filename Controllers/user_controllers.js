const User = require('../Models/user_model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const createUser = async (req, res) => {
  if (req.body.email) {
    let createdUser
    const salt = bcrypt.genSaltSync(6)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)
    createdUser = new User({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      items: []
    })
    try {
      await createdUser.save()
      res
        .status(201)
        .json(createdUser)
    } catch (err) {
      res
        .status(500)
        .json({
          Error: "Creating user failed."
        })
    }
  } else res.sendStatus(400)
}

const userLogin = (req, res) => {

  const payloadData = {
    id: req.user.id
  }

  const options = {
    expiresIn: '5min'
  }

  const token = jwt.sign(payloadData, process.env.SECRET_KEY, options)

  res.json({ token: token })
}

const getAllUsers = async (req, res) => {
  let mongoUsers
  try {
    mongoUsers = await User.find().populate('items')
  } catch (err) {
    res.sendStatus(500)
  }
  if (!mongoUsers || mongoUsers.length == 0) {
    res.sendStatus(404)
  }
  else res.json(mongoUsers)
}

const getUserById = async (req, res) => {
  let user
  try {
    user = await User.findById(req.params.id).populate('items')
  } catch (err) {
    res.status(500)
  }
  if (!user) { res.sendStatus(404) }
  else res.json(user)
}

const deleteUserById = async (req, res) => {
  let user
  try {
    user = await User.findOneAndDelete({ _id: req.params.id })
  } catch (err) {
    res.sendStatus(500)
  }
  if (!user) { res.sendStatus(404) }
  else res.json(user)
}

const updateUserById = async (req, res, next) => {

  const paramId = req.params.id
  keys = Object.keys(req.body)

  validKeys = [
    "username",
    "password",
    "email"
  ]

  if (req.user.id != paramId) {
    res.sendStatus(403)
    return next()
  }
  let ret = false
  keys.forEach(element => {
    if (!(validKeys.includes(element))) {
      ret = true
    }
  });
  if (ret) {
    res.sendStatus(400)
    return next()
  }
  let user
  try {
    user = await User.findById(paramId).populate('items')
    if (req.body.username) user.username = req.body.username
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(6)
      const hashedPassword = bcrypt.hashSync(req.body.password, salt)
      user.password = hashedPassword
    }
    if (req.body.email) user.email = req.body.email
    await user.save()
    res.status(200).json(user)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

exports.getAllUsers = getAllUsers
exports.getUserById = getUserById
exports.deleteUserById = deleteUserById
exports.createUser = createUser
exports.userLogin = userLogin
exports.updateUserById = updateUserById
const express = require('express')
const passport = require('passport')
const userControllers = require('../Controllers/user_controllers')

const router = express.Router()

router.get('/', userControllers.getAllUsers)
router.get('/:id', userControllers.getUserById)

router.post('/', userControllers.createUser)

router.post('/login', passport.authenticate("basic", {session: false}) , userControllers.userLogin)
router.put('/:id', passport.authenticate("jwt", {session: false}), userControllers.updateUserById)
router.delete('/:id', passport.authenticate("jwt", {session: false}), userControllers.deleteUserById)

module.exports = router
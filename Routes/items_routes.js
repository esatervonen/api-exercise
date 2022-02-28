const express = require('express')
const passport = require('passport')
const itemControllers = require('../Controllers/item_controllers')

const router = express.Router()

router.get('/', itemControllers.getAllItems)
router.get('/:id', itemControllers.getItemById)

router.delete('/:id', passport.authenticate('jwt', {session: false}), itemControllers.deleteItemById)
router.post('/',[ passport.authenticate('jwt', {session: false}), itemControllers.createItem])
router.put('/:id',[ passport.authenticate('jwt', {session: false}), itemControllers.updateItemById])

module.exports = router
const Item = require('../Models/item_model')
const User = require('../Models/user_model')
const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

let storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowedFormats: ['jpg', 'png']
    }
})

let uploader = multer({ storage: storage }).array('image', 4)


const getAllItems = async (req, res) => {
    const mongoItems = await Item.find().populate('seller', { username: 1, email: 1 })
    res.status(200).json(mongoItems)
    if (!mongoItems) res.sendStatus(404)
}

const getItemById = (req, res) => {
    Item.findById(req.params.id, (err, item) => {
        if (err) {
            res.sendStatus(500)
        } else if (!item) {
            res.sendStatus(404)
        } else {
            res.status(200).json(item)
        }
    })
}

const deleteItemById = (req, res) => {

    Item.findByIdAndDelete(req.params.id, (err, item) => {
        if (err) {
            res.status(500).json({
                Error: 'Deleting item failed.'
            })
        } else if (!item) {
            res.status(404).json({
                Error: 'Item not found'
            })
        } else {
            item.images.forEach(image => {
                cloudinary.uploader.destroy(image.filename)
            })
            User.findById(req.user.id, (err, foundUser) => {
                if (err) {
                    res.status(500).json({
                        Error: 'Updating user failed'
                    })
                } else {
                    foundUser.items = foundUser.items.filter(it => it != item.id)
                    foundUser.save((err, user) => {
                        if (err) {
                            res.status(500).json({
                                Error: 'updating user failed'
                            })
                        } else {
                            res.status(200).json(item)
                        }
                    })
                }
            })
        }
    })
}

const createItem = (req, res) => {

    uploader(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.status(400).json({
                Error: 'Too many images or wrong filetype? Max limit is 4 jpeg/png files.'
            })
        } else if (err) {
            // An unknown error occurred when uploading.
            res.status(500).json({
                Error: 'uploading images failed.'
            })
        } else {
            let user
            User.findById(req.user.id, (err, foundUser) => {
                if (err) {
                    res.status(404).json({
                        Error: 'Item seller not found'
                    })
                } else {
                    user = foundUser
                }
            })

            const createdItem = new Item({
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                location: req.body.location,
                images: req.files,
                price: req.body.price,
                postingDate: Date.now(),
                deliveryType: req.body.deliveryType,
                seller: req.user.id
            })
            createdItem.save((err, item) => {
                if (err) {
                    console.log(err.errors)
                    res.status(500).json({
                        Error: "Creating item failed."
                    })
                } else {
                    let items = []
                    items = req.user.items
                    items.push(item.id)
                    user.items = items
                    user.save((err, user) => {
                        if (err) {
                            res.status(500).json({
                                Error: 'updating user failed'
                            })
                        } else {
                            res.status(201).json(item)
                        }
                    })
                }
            })
        }
    })
}

const updateItemById = (req, res) => {

    Item.findById(req.params.id, (err, foundItem) => {
        if (err) {
            res.status(500).json({
                Error: 'Something went wrong'
            })
        } else if (!foundItem) {
            res.status(404).json({
                Error: 'Item not found'
            })
        } else {

            uploader(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred when uploading.
                    res.status(400).json({
                        Error: 'Too many images? Max limit is 4.'
                    })
                } else if (err) {
                    // An unknown error occurred when uploading.
                    res.status(500).json({
                        Error: 'uploading images failed.'
                    })
                } else {
                    foundItem.images.forEach(image => {
                        cloudinary.uploader.destroy(image.filename)
                    })

                    foundItem.title = req.body.title,
                        foundItem.description = req.body.description,
                        foundItem.category = req.body.category,
                        foundItem.location = req.body.location,
                        foundItem.images = req.files,
                        foundItem.price = req.body.price,
                        foundItem.postingDate = Date.now(),
                        foundItem.deliveryType = req.body.deliveryType,
                        foundItem.seller = req.user.id

                    foundItem.save((err, savedItem) => {
                        if (err) {
                            res.status(500).json({
                                Error: "Updating item failed."
                            })
                        } else {
                            res.status(201).json(savedItem)
                        }
                    })
                }
            })
        }
    })
}

exports.getAllItems = getAllItems
exports.getItemById = getItemById
exports.deleteItemById = deleteItemById
exports.createItem = createItem
exports.updateItemById = updateItemById

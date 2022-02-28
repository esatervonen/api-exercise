const Item = require('../Models/item_model')

const getSearchedItems = async (req, res) => {

    let categoryParam
    let locationParam
    let dateParam
    if (typeof req.query.category == "string") {
        categoryParam = req.query.category
    } else if (req.query.category) {
        categoryParam = req.query.category.join()
    }
    if (typeof req.query.location == "string") {
        locationParam = req.query.location
    } else if (req.query.location) {
        locationParam = req.query.location.join()
    }
    if (req.query.postingDate) {
       try {
        dateParam = new Date(req.query.postingDate * 1000)
       } catch (err) {
           res.sendStatus(500)
       }
    }

    let items = []
    try {
        const mongoItems = await Item.find().populate('seller', {username: 1, email: 1})
        items = mongoItems
        if (categoryParam) {
            items = items.filter(item => categoryParam.toLowerCase().includes(item.category.toLowerCase()))
        }
        if (locationParam) {
            items = items.filter(item => locationParam.toLowerCase().includes(item.location.toLowerCase()))
        }
        if (dateParam) {
            items = items.filter(item => dateParam < item.postingDate)
        }
    } catch (error) {
        res.status(500).json({
            Error: 'Search failed'
        })       
    }
    if(items.length == 0) { 
        res.status(404).json({
            Error: 'No items found with given parameters'
        })
    } else {
        res
        .status(200)
        .json(items)
    }

}

exports.getSearchedItems = getSearchedItems
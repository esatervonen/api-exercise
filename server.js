const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3001
const mongoose = require('mongoose')
const usersRoutes = require('./Routes/users_routes')
const itemsRoutes = require('./Routes/items_routes')
const searchControllers = require('./Controllers/search_controllers')
const bodyParser = require('body-parser')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy
const User = require('./Models/user_model')
const bcrypt = require('bcryptjs')
const JwtStrategy = require('passport-jwt').Strategy,
     ExtractJwt = require('passport-jwt').ExtractJwt

app.use(bodyParser.json())

const MONGO_URI = process.env.NODE_ENV == 'test' ? process.env.TEST_DB_URI : process.env.DEV_DB_URI

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.SECRET_KEY

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findById(jwt_payload.id, function (err, user) { 
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        return done(null, user)
    })
}));

passport.use(new BasicStrategy(
    function(username, password, done) {
      User.findOne({username: username}, async function (err, user) {
        if (err) { return done(err) }
        if (!user) { return done(null,false) }
        if ( await bcrypt.compare(password, user.password)) { return done(null,user) }
        return done(null, false)
      })  
    }
  ))

app.use('/users',usersRoutes)
app.use('/items',itemsRoutes)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/search', searchControllers.getSearchedItems)

mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch(err => {
        console.log(err)
    })
let serverInstance = null
module.exports = {
  start: function () {
    serverInstance = app.listen(port)
  //   mongoose
  //   .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
  //   .then(() => {
  //       serverInstance = app.listen(port)
  //       console.log("Connected to MongoDB")
  //   })
  //   .catch(err => {
  //       console.log(err)
  //   })  
  // 
  },
  close: function () {
    serverInstance.close()
  }
}
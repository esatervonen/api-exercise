process.env.NODE_ENV = 'test'

const server = require('../server')
const chai = require('chai')
const chaiHttp = require('chai-http')
const User = require('../Models/user_model')
const Item = require('../Models/item_model')
const { expect } = require('chai')
const serverAddress = 'http://localhost:3001'
const cloudinary = require('cloudinary').v2

chai.use(chaiHttp)

let userId
let token
let itemId

before(function (done) {
    server.start()
    User.deleteMany({}, (err, res) => {
        if (err) console.error(err)
        else {
            Item.find((err, docs) => {
                if (err) console.error(err)
                else {
                    docs.forEach(doc => {
                        doc.images.forEach(image => {
                            cloudinary.uploader.destroy(image.filename)
                        })
                    });
                    Item.deleteMany({}, (err, res) => {
                        if (err) console.error(err)
                        else {
                            console.log(res)
                            done()
                        }
                    })
                }
            })
        }
    })

})
after(function () {
    server.close()
})

describe('GET /', function () {
    it('should get root page', (done) => {
        chai.request(serverAddress)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.equal('Hello World!')
                done()
            })
    })
});

describe('POST /users', function () {
    it('should create a user and return it', (done) => {
        chai.request(serverAddress)
            .post('/users')
            .send({
                username: "Testi Käyttäjä",
                password: "TestiSalasana",
                email: "testi@testi.fi"
            })
            .end((err, res) => {
                expect(res).to.have.status(201)
                expect(res.body).to.have.property('_id')
                userId = res.body._id
                done()
            })
    })
});

describe('POST /users', function () {
    it('should NOT create a user and return it because does not have all required fields in request', (done) => {
        chai.request(serverAddress)
            .post('/users')
            .send({
                username: "Testi Käyttäjä",
                password: "TestiSalasana"
            })
            .end((err, res) => {
                expect(res).to.have.status(500)
                expect(res.body).to.have.property('Error')
                done()
            })
    })
});
describe('GET /users', function () {
    it('should return all users', (done) => {
        chai.request(serverAddress)
            .get('/users')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.a('array')
                done()
            })
    })
});
describe('GET /users/:id', function () {
    it('should return user with given id', (done) => {
        chai.request(serverAddress)
            .get(`/users/${userId}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.a('object')
                done()
            })
    })
});
describe('POST /users/login', function () {
    it('should return a json web token', (done) => {
        chai.request(serverAddress)
            .post('/users/login')
            .auth('Testi Käyttäjä', 'TestiSalasana')
            .end((err, res) => {
                expect(res).to.have.status(200)
                token = res.body.token
                done()
            })
    })
});
describe('POST /users/login', function () {
    it('should NOT return a json web token because wrong password', (done) => {
        chai.request(serverAddress)
            .post('/users/login')
            .auth('Testi Käyttäjä', 'VääräSalasana')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.empty
                done()
            })
    })
});
describe('PUT /users/:id', function () {
    it('should return an updated user with given id', (done) => {
        chai.request(serverAddress)
            .put(`/users/${userId}`)
            .auth(token, { type: 'bearer' })
            .send({
                username: "Testi Testaaja",
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.a('object')
                expect(res.body._id).to.equal(userId)
                done()
            })
    })
});
describe('PUT /users/:id', function () {
    it('should NOT return an updated user with given id because wrong token', (done) => {
        chai.request(serverAddress)
            .put(`/users/${userId}`)
            .auth('234fsda7.weqr9fasdv79asd.sfd987', { type: 'bearer' })
            .send({
                username: "Testi Testaaja",
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.empty
                done()
            })
    })
});
describe('PUT /users/:id', function () {
    it('should NOT return an updated user with given id because invalid request body', (done) => {
        chai.request(serverAddress)
            .put(`/users/${userId}`)
            .auth(token, { type: 'bearer' })
            .send({
                username: "Testi Käyttäjä",
                random: "input"
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.empty
                done()
            })
    })
});

/* ITEM REQUESTS */

let imagesArray = ["./test/images/images-2.jpeg", "./test/images/images-3.jpeg", "./test/images/images-4.jpeg"]

describe('POST /items', function () {
    it('should create an item and return it', (done) => {
        const agent = chai.request.agent(serverAddress)
        let postAgent = agent
            .post('/items')
            .auth(token, { type: 'bearer' })
            .field("Content-Type", "multi-part/form-data")
            .field("title", "Ruuvi")
            .field("description", "Hieman kiero")
            .field("category", "Rakentaminen")
            .field("location", "Kuusamo")
            .field("price", "2€")
            .field("deliveryType", "Shipping")
        for (let i = 0; i < imagesArray.length; i++) {
            postAgent = postAgent.attach('image', imagesArray[i])
        }
        postAgent.end((err, res) => {
            expect(res).to.have.status(201)
            expect(res.body).to.have.property('_id')
            itemId = res.body._id
            done()
        })
    })
});
describe('POST /items', function () {
    it('should NOT create an item and return it because of wrong token', (done) => {
        const agent = chai.request.agent(serverAddress)
        let postAgent = agent
            .post('/items')
            .auth('sdfv87dsfv678dsfv5.adf768asfd986', { type: 'bearer' })
            .field("Content-Type", "multi-part/form-data")
            .field("title", "Ruuvi")
            .field("description", "Hieman kiero")
            .field("category", "Rakentaminen")
            .field("location", "Kuusamo")
            .field("price", "2€")
            .field("deliveryType", "Shipping")
        for (let i = 0; i < imagesArray.length; i++) {
            postAgent = postAgent.attach('image', imagesArray[i])
        }
        postAgent.end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.be.empty
            done()
        })
    })
});

let tooMuchArray = ["./test/images/images-2.jpeg", "./test/images/images-3.jpeg", "./test/images/images-4.jpeg", "./test/images/images-5.jpeg", "./test/images/images-6.jpeg"]
describe('POST /items', function () {
    it('should NOT create an item and return it because of too many images', (done) => {
        const agent = chai.request.agent(serverAddress)
        let postAgent = agent
            .post('/items')
            .auth(token, { type: 'bearer' })
            .field("Content-Type", "multi-part/form-data")
            .field("title", "Ruuvi")
            .field("description", "Hieman kiero")
            .field("category", "Rakentaminen")
            .field("location", "Kuusamo")
            .field("price", "2€")
            .field("deliveryType", "Shipping")
        for (let i = 0; i < tooMuchArray.length; i++) {
            postAgent = postAgent.attach('image', tooMuchArray[i])
        }
        postAgent.end((err, res) => {
            expect(res).to.have.status(400)
            done()
        })
    })
});

imagesArray.splice(0, 1)

describe('PUT /items/:id', function () {
    it('should update an item and return it', (done) => {
        const agent = chai.request.agent(serverAddress)
        let postAgent = agent
            .put(`/items/${itemId}`)
            .auth(token, { type: 'bearer' })
            .field("Content-Type", "multi-part/form-data")
            .field("title", "Ruuvi")
            .field("description", "Melkein suora")
            .field("category", "Rakentaminen")
            .field("location", "Kuusamo")
            .field("price", "22€")
            .field("deliveryType", "Shipping")
        for (let i = 0; i < imagesArray.length - 1; i++) {
            postAgent = postAgent.attach('image', imagesArray[i])
        }
        postAgent.end((err, res) => {
            expect(res).to.have.status(201)
            expect(res.body._id).to.equal(itemId)
            done()
        })
    })
});
describe('PUT /items/:id', function () {
    it('should NOT update an item and return it because of wrong id', (done) => {
        const agent = chai.request.agent(serverAddress)
        let postAgent = agent
            .put('/items/621a66c488ba60596a941755')
            .auth(token, { type: 'bearer' })
            .field("Content-Type", "multi-part/form-data")
            .field("title", "Ruuvi")
            .field("description", "Melkein suora")
            .field("category", "Rakentaminen")
            .field("location", "Kuusamo")
            .field("price", "22€")
            .field("deliveryType", "Shipping")
        for (let i = 0; i < imagesArray.length - 1; i++) {
            postAgent = postAgent.attach('image', imagesArray[i])
        }
        postAgent.end((err, res) => {
            expect(res).to.have.status(404)
            done()
        })
    })
});

/* SEARCH TESTS */

describe('GET /search?location=Kuusamo', function () {
    it('should return items with given parameters', (done) => {
        chai.request(serverAddress)
            .get("/search?location=Kuusamo")
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.a('array')
                expect(res.body[0].location).to.equal('Kuusamo')
                done()
            })
    })
});
describe('GET /search?location=Kuusamo&category=Rakentaminen', function () {
    it('should return items with given parameters', (done) => {
        chai.request(serverAddress)
            .get("/search?location=Kuusamo")
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.a('array')
                expect(res.body[0].category).to.equal('Rakentaminen')
                done()
            })
    })
});

/* DELETE REQUESTS */

describe('DELETE /items/:id', function () {
    it('should delete an item', (done) => {
        chai.request(serverAddress)
        .delete(`/items/${itemId}`)
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body._id).to.equal(itemId)
            done()
        })
    })
  });

  describe('DELETE /users/:id', function () {
    it('should delete user with given id', (done) => {
        chai.request(serverAddress)
        .delete(`/users/${userId}`)
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.be.a('object')
            expect(res.body._id).to.equal(userId)
            done()
        })
    })
  });

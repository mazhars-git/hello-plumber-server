const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
require('dotenv').config();



const app = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cpoqr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('services'));
app.use(fileUpload());

const port = 5500;


app.get('/', (req, res) => {
  res.send('Hello World! Plumber Server')
})




client.connect(err => {
  const serviceCollection = client.db("plumberService").collection("services");
  const reviewCollection = client.db("plumberService").collection("reviews");
  const adminCollection = client.db("plumberService").collection("admins");
  const orderCollection = client.db("plumberService").collection("orders");

  app.post('/addAService', (req, res) =>{
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    serviceCollection.insertOne({title, description, image})
    .then(result => {
      console.log(result)
      res.send(result.insertedCount > 0)
    })
  });

  app.get('/services', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  });

  app.get('/service/:id', (req, res) => {
    serviceCollection.find({_id: ObjectID(req.params.id)})
    .toArray((err, documents) => {
      res.send(documents[0])
    })
  })

  app.post('/addReview', (req, res) =>{
    const file = req.files.file;
    const name = req.body.name;
    const designation = req.body.name;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    reviewCollection.insertOne({name, designation, description, image})
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  });

  app.get('/review', (req, res) => {
    reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  });

  app.post('/makeAdmin', (req, res) =>{
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  });

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
        .toArray((err, admins) => {
            res.send(admins.length > 0);
        })
  })

  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    console.log('order', newOrder)
    orderCollection.insertOne(newOrder)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find({email: req.query.email})
        .toArray((err, documents) => {
            res.send(documents);
        })
  })


});


app.listen(process.env.PORT || port);
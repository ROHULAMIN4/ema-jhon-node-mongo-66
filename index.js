const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const dotenv = require("dotenv");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// manere
app.use(cors());
app.use(express.json());

// backnend server started

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4vnd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("onlineShop");
    const productsCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    console.log("connect database successfully");
    // GET PRODUCT API
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      // count ,skip size,page  (paginationar jonno kora hoise)
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const count = await cursor.count();
      let product;
      if (page) {
        product = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        product = await cursor.toArray();
      }

      // pagination

      res.send({
        count,
        product,
      });
    });
    // post api by using card
    app.post("/products/keys", async (req, res) => {
      const keys = req.body;
      const query = { key: { $in: keys } };
      const product = await productsCollection.find(query).toArray();
      res.json(product);
    });
    // add order api
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("staart the root folder");
});
app.listen(port, () => {
  console.log("server is runnig ", port);
});

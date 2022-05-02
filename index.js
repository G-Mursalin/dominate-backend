const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// JWT

// Middleware
app.use(cors());
app.use(express.json());

// Connecting to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0zujr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// Operations
async function run() {
  try {
    await client.connect();
    const carCollections = client.db("carCollections").collection("cars");

    // Get Data
    app.get("/cars", async (req, res) => {
      const dataSize = parseInt(req.query.size);
      let results;
      if (dataSize) {
        results = await carCollections
          .find({})
          .skip(0)
          .limit(dataSize)
          .toArray();
      } else {
        results = await carCollections.find({}).toArray();
      }
      res.send(results);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Paths
app.get("/", (req, res) => {
  res.send("Hello Server!");
});

// Listening
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

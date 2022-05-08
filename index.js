const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// JWT
const jwt = require("jsonwebtoken");
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

    // Get All Data
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
    // Get Data vai Email
    app.get("/mycars", async (req, res) => {
      const email = req.query.email;
      const results = await carCollections.find({ email: email }).toArray();
      res.send(results);
    });
    // Get one data using id
    app.get("/car/:id", async (req, res) => {
      const result = await carCollections.findOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    // Delete data
    app.delete("/car/:id", async (req, res) => {
      const [email, accessToken] = req.headers.authorization.split(" ");
      if (email === verifyToken(accessToken).email) {
        const result = await carCollections.deleteOne({
          _id: ObjectId(req.params.id),
        });
        res.send({ success: "Delete successfully" });
      } else {
        res.send({ success: "Unauthorize Access" });
      }
    });
    // Update data
    app.put("/car/:id", async (req, res) => {
      const [email, accessToken] = req.headers.authorization.split(" ");
      if (email === verifyToken(accessToken).email) {
        const result = await carCollections.updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: { available: req.body.available },
          },
          { upsert: true }
        );
        res.send({ success: "Updated successfully" });
      } else {
        res.send({ success: "Unauthorize Access" });
      }
    });

    // Add Data
    app.post("/addcar", async (req, res) => {
      const [email, accessToken] = req.headers.authorization.split(" ");
      if (email === verifyToken(accessToken).email) {
        const result = await carCollections.insertOne(req.body);
        res.send({ success: "Updated successfully" });
      } else {
        res.send({ success: "Unauthorize Access" });
      }
    });

    //JWT
    app.post("/login", async (req, res) => {
      const userEmail = req.body;
      const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN_SECRET);
      res.send({ token });
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

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      email = "Invalid Email";
    }
    if (decoded) {
      email = decoded;
    }
  });

  return email;
}

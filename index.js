const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporarily store the uploaded file
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const { UploadFile } = require("./functions/UploadFile");
const {
  GenerateImageUsingSDAPI,
  GenerateImageUsingReplicate,
} = require("./functions/GenerateImage");

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const RunTheServer = async () => {
  try {
    const usersCollection = client.db("database").collection("usersCollection");
    const imagesCollection = client
      .db("database")
      .collection("imagesCollection");
    //endpoints

    //users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    //images
    app.get("/images", async (req, res) => {
      const query = {};
      const cursor = imagesCollection.find(query);
      const images = await cursor.toArray();
      res.send(images);
    });

    app.post("/images", upload.single("image"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("file received");
        const file = req.file;
        const { author, city, state, zip } = req.body;
        let data = { author, city, state, zip };

        const folderName = "uploads69";
        const fileUrl = await UploadFile(file, folderName);
        const formattedData = {
          ...data,
          fileUrl,
        };
        const result = await imagesCollection.insertOne(formattedData);
        res.send(result);
        console.log(formattedData);
        console.log(`image URL: ${fileUrl}`);
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to upload wallpaper");
      }
    });

    app.post("/generate", upload.single("image"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("file received");
        const file = req.file;
        const { author, city, state, zip } = req.body;
        let data = { author, city, state, zip };
        const prompt = author;
        // const fileUrl = await GenerateImageUsingSDAPI(prompt);
        const fileUrl = await GenerateImageUsingReplicate(prompt);
        const formattedData = {
          ...data,
          fileUrl,
        };
        const result = await imagesCollection.insertOne(formattedData);
        console.log("response from db:", result);
        const response = { id: result.insertedId, fileUrl: fileUrl };
        console.log(response);
        res.send(response);
      } catch (err) {
        console.error(err);
        res.status(500).send("Failed to upload wallpaper");
      }
    });

    // Main error and final log
  } catch (error) {
    console.log(error);
  } finally {
    console.log("computation completed");
  }
};
RunTheServer().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Hello and Welcome!!!");
});

app.listen(port, () => {
  console.log("server running at full speed on port:", port);
});

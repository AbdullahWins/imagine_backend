const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporarily store the uploaded file
const port = process.env.port || 5000;
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  storageBucket: process.env.FIRE_STORAGE_BUCKET_NAME,
});

// Firebase storage bucket
const bucket = admin.storage().bucket();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
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
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const { author, city, state, zip } = req.body;

        const destination = "uploads/" + fileName;
        console.log("starting upload");
        bucket.upload(
          filePath,
          {
            destination: destination,
            metadata: {
              contentType: req.file.mimetype,
            },
          },
          (err, uploadedFile) => {
            if (err) {
              console.error("Error uploading file:", err);
              return res.status(500).json({ error: "Failed to upload file" });
            }

            const fileUrl = uploadedFile.publicUrl();
            // Delete the temporarily stored file
            fs.unlinkSync(filePath);
            console.log(fileUrl);
            const processedData = { author, city, state, zip, fileUrl };
            imagesCollection
              .insertOne(processedData)
              .then((result) => {
                console.log("upload finished");
                res.json(result);
              })
              .catch((error) => {
                console.error("Error inserting data:", error);
                res.status(500).json({ error: "Failed to insert data" });
              });
          }
        );
      } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    });

    // Main error and final log
  } catch (error) {
    console.log(error);
  } finally {
    console.log("computation completed");
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Hello and Welcome!!!");
});

app.listen(port, () => {
  console.log("server running at full speed on port:", port);
});

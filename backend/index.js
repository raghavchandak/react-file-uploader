import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import "./models/docs.js";

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(
    "mongodb+srv://raghav:Sachinmessi%4010@twokey.njamp3t.mongodb.net/assessment?retryWrites=true&w=majority&appName=TwoKey"
  )
  .then(() => console.log("Connected to database"))
  .catch((e) => console.log(e));

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
const docs = mongoose.model("Docs");

app.get("/fetch-docs", async (req, res) => {
  const allDocs = await docs.find({});
  res.send(allDocs);
});

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    docs.create({
      doc: req.file.buffer,
      title: req.body.title,
      type: req.body.type,
    });
    res.send({ status: "Created" });
  } catch (e) {
    res.send({ status: e });
  }
});

app.get("/files/:id", async (req, res) => {
  try {
    const doc = await docs.findById(req.params.id);
    if (!doc) {
      return res.status(404).send({ status: "Not Found" });
    }
    // res.set("Content-Type", doc.type);
    res.send(doc?.doc?.data);
  } catch (e) {
    res.status(500).send({ status: e.message });
  }
});

app.listen(8000, () => console.log("Server listening on port 8000"));

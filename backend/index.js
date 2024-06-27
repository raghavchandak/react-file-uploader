import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import mammoth from "mammoth";
import puppeteer from "puppeteer";
import "dotenv/config";
import "./models/docs.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Database connection
mongoose
  .connect(
    `mongodb+srv://raghav:${process.env.PASSWORD}@twokey.njamp3t.mongodb.net/assessment?retryWrites=true&w=majority&appName=TwoKey`
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

app.post("/view/docx", async (req, res) => {
  const buffer = Buffer.from(req.body);
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();
  res.setHeader("Content-Type", "application/pdf");
  res.send(pdfBuffer);
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

app.listen(8000, () => console.log("Server listening on port 8000"));

import mongoose from "mongoose";

const docsSchema = new mongoose.Schema(
  {
    doc: Buffer,
    title: String,
    type: String,
  },
  { collection: "docs" }
);

mongoose.model("Docs", docsSchema);

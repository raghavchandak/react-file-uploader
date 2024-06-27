import React, { useState, useEffect, useCallback } from "react";
import { uploadFile, fetchFiles } from "./api";
import { pdfjs } from "react-pdf";
import "./App.css";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Button from "@mui/joy/Button";
import OpenDocs from "./components/openDocs";
import ArticleIcon from "@mui/icons-material/Article";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [docList, setDocList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [open, setOpen] = useState(false);
  const [upload, setUpload] = useState(false);

  const icons = {
    "application/pdf": <PictureAsPdfIcon className="icon" />,
    "image/jpeg": <ImageIcon className="icon" />,
    "image/png": <ImageIcon className="icon" />,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
      <ArticleIcon className="icon" />
    ),
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      <PictureAsPdfIcon className="icon" />,
  };

  useEffect(() => {
    fetchAllFiles();
    setUpload(false);
  }, [upload]);

  const fetchAllFiles = async () => {
    const files = await fetchFiles();
    setDocList(files.data);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", file?.type);

    await uploadFile(formData);
    setUpload(true);
  };

  const handleSelect = (doc) => {
    if (selectedList.length < 3) setSelectedList([...selectedList, doc]);
    else {
      let newList = selectedList.slice(1);
      newList.push(doc);
      setSelectedList(newList);
    }
  };

  const openDocs = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedList([]);
  };

  const handleDownload = (doc) => {
    const binaryDataBuffer = doc?.doc?.data;
    const bufferArray = new Uint8Array(binaryDataBuffer).buffer;

    const blob = new Blob([bufferArray], {
      type: doc?.type,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    a.download = doc?.title;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="main-container">
        <form className="formStyle" onSubmit={handleUpload}>
          <br />
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <input
            type="file"
            className="form-control"
            required
            onChange={(e) => setFile(e.target.files[0])}
          />
          <br />
          <button type="submit">Upload</button>
        </form>
      </div>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Button
          onClick={openDocs}
          disabled={selectedList.length === 0 ? true : false}
        >
          Open
        </Button>
      </div>
      <div className="docs">
        {docList.map((doc) => (
          <div
            key={doc._id}
            className="doc-icon"
            style={{
              backgroundColor: selectedList.includes(doc)
                ? "#d3d2ff"
                : "#f1f1f1",
            }}
          >
            {icons[doc?.type]}
            <p className="doc-title">{doc.title}</p>
            <button onClick={() => handleSelect(doc)}>Select</button>
            <button onClick={() => handleDownload(doc)}>Download</button>
          </div>
        ))}
      </div>

      <OpenDocs open={open} handleClose={handleClose} docs={selectedList} />
    </>
  );
}

export default App;

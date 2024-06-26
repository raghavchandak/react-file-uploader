import React, { useState, useEffect, useCallback } from "react";
import { uploadFile, fetchFiles } from "./api";
import { pdfjs } from "react-pdf";
import "./App.css";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Button from "@mui/joy/Button";
import OpenDocs from "./components/openDocs";
import sample from "./assets/sample.docx";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  const docs = [
    { uri: require("./assets/sample.pdf") }, // Local File
  ];

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [docList, setDocList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [open, setOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // State for storing the PDF URL

  const mimeTypes = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    "vnd.openxmlformats-officedocument.wordprocessingml.document":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    const files = await fetchFiles();
    console.log(files);
    setDocList(files.data);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    let type = file.type.split("/")[1];

    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);

    console.log("New File", file.type);
    // await uploadFile(formData);
    fetchAllFiles(); // Fetch files after upload to refresh the list
  };

  const handleSelect = (doc) => {
    if (selectedList.length < 3) setSelectedList([...selectedList, doc]);
    else {
      let newList = selectedList.slice(1);
      newList.push(doc);
      console.log(newList);
      setSelectedList(newList);
    }
  };

  const openDocs = () => {
    setOpen(true);
    console.log(selectedList);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedList([]);
  };

  const handleDownload = (doc) => {
    const binaryDataBuffer = doc?.doc?.data;
    const bufferArray = new Uint8Array(binaryDataBuffer).buffer;

    const blob = new Blob([bufferArray], {
      type: mimeTypes[doc?.type],
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

  const createUrl = useCallback(async (doc) => {
    console.log("Doc received: ", doc);
    const binaryDataBuffer = doc?.doc?.data;
    const bufferArray = new Uint8Array(binaryDataBuffer);

    const blob = new Blob([bufferArray], {
      type: mimeTypes[doc?.type],
    });

    const base64 = await blobToBase64(blob);
    const base64Url = `data:${mimeTypes[doc?.type]};base64,${
      base64.split(",")[1]
    }`;
    console.log("Base64 URL: ", base64Url);
    setPdfUrl(base64Url); // Set the Base64 URL in the state
  }, []);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  useEffect(() => {
    if (docList.length > 0) {
      createUrl(docList[0]); // Create URL for the first document in the list
    }
  }, [docList, createUrl]);

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
            key={doc._id} // Add key prop for each document
            className="doc-icon"
            style={{
              backgroundColor: selectedList.includes(doc)
                ? "#d3d2ff"
                : "#f1f1f1",
            }}
          >
            {doc.type === "pdf" ? (
              <PictureAsPdfIcon className="icon" />
            ) : (
              <ImageIcon className="icon" />
            )}
            <p className="doc-title">{doc.title}</p>
            <button onClick={() => handleSelect(doc)}>Select</button>
            <button onClick={() => handleDownload(doc)}>Download</button>
          </div>
        ))}
      </div>

      <OpenDocs open={open} handleClose={handleClose} docs={selectedList} />
      {pdfUrl && (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=http://localhost:8000/files/${docList[10]._id}`}
          width="100%"
          height="500px"
          title="pdf"
          onLoad={() => console.log("PDF loaded successfully")}
          onError={(e) => console.error("Error loading PDF:", e)}
        />
      )}
      {/* <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} /> */}
    </>
  );
}

export default App;

import { useState, useEffect, useMemo } from "react";
import { Document, Page } from "react-pdf";
import "../styles/pdfComp.css";
import { convertDocx } from "../api";

const PdfComp = ({ pdf, type, name }) => {
  const [numPages, setNumPages] = useState(null);
  const [displayedDocx, setDisplayedDocx] = useState(null);

  useEffect(() => {
    const docxFileHandler = async (buffer) => {
      try {
        const response = await convertDocx(buffer.data);
        const arrayBuf = response.data;
        const uint8Array = new Uint8Array(arrayBuf);
        const simpleArray = Array.from(uint8Array);
        setDisplayedDocx(simpleArray);
      } catch (error) {
        console.error("Error converting docx:", error);
      }
    };

    if (type.typedoc === "application/pdf") {
      setDisplayedDocx(pdf.data);
    } else {
      docxFileHandler(pdf);
    }
  }, [pdf, type]);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages); 
  }

  const filesystem = useMemo(
    () =>
      displayedDocx ? (
        <div className="container">
          <Document
            file={{ data: displayedDocx }}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
          <p>Page {numPages ? `1 of ${numPages}` : "Loading..."}</p>
        </div>
      ) : (
        <div style={{ margin: "3rem" }}>Loading PDF/Word...</div>
      ),
    [displayedDocx, numPages]
  );

  return filesystem;
};

export default PdfComp;

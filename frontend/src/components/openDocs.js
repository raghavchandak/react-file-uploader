import * as React from "react";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import PdfComp from "./pdfComp";

const arrayBufferToBase64 = (buffer) => {
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
};

export default function BasicModal({ open, handleClose, docs }) {
  return (
    <React.Fragment>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={handleClose}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: "95vw",
            height: "90vh",
            borderRadius: "md",
            boxShadow: "lg",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {docs?.map((doc) => {
              return doc.type === "pdf" ? (
                <PdfComp pdf={{ data: doc?.doc?.data }} />
              ) : (
                <img
                  src={`data:image/jpeg;base64,${arrayBufferToBase64(
                    doc?.doc?.data
                  )}`}
                  alt="img"
                  style={{
                    maxWidth: "30vw",
                    objectFit: "contain",
                  }}
                />
              );
            })}
          </div>

          {/* <iframe
            title="pdf"
            src={`data:image/jpeg;base64,${arrayBufferToBase64(
              docs[0]?.doc?.doc?.data
            )}`}
          ></iframe> */}
        </Sheet>
      </Modal>
    </React.Fragment>
  );
}

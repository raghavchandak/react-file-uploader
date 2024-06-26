import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/",
});

export const uploadFile = (data) => {
  return api.post("upload", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const fetchFiles = () => {
  return api.get("fetch-docs");
};

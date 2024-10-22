import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/", // Adjust this if your server runs on a different URL
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

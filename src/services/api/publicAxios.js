import axios from "axios";

const publicAxios = axios.create({
  baseURL: "http://35.247.185.8/api",
  headers: { "Content-Type": "application/json" },
});

export default publicAxios;

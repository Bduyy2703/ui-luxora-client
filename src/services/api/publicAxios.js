import axios from "axios";

const publicAxios = axios.create({
  baseURL: "https://www.dclux.store/api/",
  headers: { "Content-Type": "application/json" },
});

export default publicAxios;

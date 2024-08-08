import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
});
export const auth = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

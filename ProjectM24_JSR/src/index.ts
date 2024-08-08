import axios from "axios";

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
});

export const auth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_HOST,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

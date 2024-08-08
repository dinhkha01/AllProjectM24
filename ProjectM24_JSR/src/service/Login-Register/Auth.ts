import { api } from "..";
export const registerApi = async (user: {}) => {
  const res = await api.post("register", user);
  return res.data;
};

export const loginApi = async (data: { email: string; password: string }) => {
  const res = await api.post("login", data);
  return res.data;
};

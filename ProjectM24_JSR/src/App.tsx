import Router from "./router";
import "./index.css";
import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { autoLogin, login } from "./service/Login-Register/User";
import { useNavigate } from "react-router-dom";

function App() {
  console.log(import.meta.env.VITE_API_HOST);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(autoLogin());
    } else {
      navigate("/login");
    }
  });
  return (
    <div>
      <Router />
    </div>
  );
}

export default App;

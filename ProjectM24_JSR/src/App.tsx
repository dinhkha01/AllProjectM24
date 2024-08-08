import Router from "./router";
import "./index.css";
import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { autoLogin, login } from "./service/Login-Register/User";
import { useNavigate } from "react-router-dom";

function App() {
 

  return (
    <div>
      <Router />
    </div>
  );
}

export default App;

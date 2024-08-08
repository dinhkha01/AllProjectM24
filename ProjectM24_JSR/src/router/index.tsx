// admin :   localhost:5173/admin/acccount
// user :    localhost:5173/home

import { Route, Routes } from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import HomePage from "../pages/HomePage";
import Admin from "../pages/Admin";

import Frends from "../components/User/Frends";
import TrangChu from "../components/User/TrangChu";
import Profile from "../components/User/Profile";
import Friends from "../components/User/Frends";
import Notify from "../components/User/Notify";
import ProfileUser from "../components/User/ProfileUser";
import Group from "../components/User/Group";
import ProfileGroup from "../components/User/ProfileGroup";

const Router = () => {
  return (
    <div>
      <Routes>
        <Route path="/registor" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<HomePage />}>
          <Route index element={<TrangChu />} />
          <Route path="frends" element={<Friends />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notify" element={<Notify />} />
          <Route path="group" element={<Group />} />
          <Route path="/group/:groupId" element={<ProfileGroup />} />
          <Route path="user/:userId" element={<ProfileUser />} />
        </Route>

        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
};

export default Router;

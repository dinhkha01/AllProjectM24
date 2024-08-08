import { Avatar, Card } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../../store";

const MenuR = () => {
  const user = useSelector((state: RootState) => state.users.currentUser);
  const allUsers = useSelector((state: RootState) => state.users.users);

  // Filter friends with 'accept' status
  const friends = user?.friends
    ?.filter((friend) => friend.status === "accept")
    .map((friend) => {
      return allUsers.find((u) => u.id === friend.userId);
    })
    .filter(Boolean);

  return (
    <div>
      <Card title="Thông tin của bạn">
        <NavLink
          to="profile"
          style={() => ({
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "inherit",
          })}
        >
          <Avatar src={user?.avatar} size={40} />
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {user?.name}
          </span>
        </NavLink>
      </Card>
      <Card title="Người liên hệ" style={{ marginTop: 16 }}>
        {friends && friends.length > 0 ? (
          friends.map((friend: any) => (
            <NavLink
              key={friend.id}
              to={`user/${friend.id}`}
              style={() => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                color: "inherit",
                marginBottom: "8px",
              })}
            >
              <Avatar src={friend.avatar} size={40} />
              <span style={{ fontSize: "14px" }}>{friend.name}</span>
            </NavLink>
          ))
        ) : (
          <span>Không có người liên hệ</span>
        )}
      </Card>
    </div>
  );
};

export default MenuR;

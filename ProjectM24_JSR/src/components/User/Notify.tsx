import React, { useState, useEffect } from "react";
import { List, Avatar, Typography, Button, Divider, message } from "antd";
import { BellOutlined, UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  acceptFriendRequest,
  getAllUsers,
  rejectFriendRequest,
} from "../../service/Login-Register/User";
import { notyfiType } from "../../config/interface";

const { Title, Text } = Typography;


interface CurrentUser {
  id: number;
  notyfi: notyfiType[];
  friends: { userId: number; status: string }[];
}

const Notify = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser
  ) as CurrentUser | null;
  const allUsers = useSelector((state: RootState) => state.users.users);
  const [friendRequests, setFriendRequests] = useState<notyfiType[]>([]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const isAcceptedFriend = (userId: number) => {
    return currentUser?.friends.some(
      (friend) => friend.userId === userId && friend.status === "accept"
    );
  };

  useEffect(() => {
    if (currentUser && currentUser.notyfi) {
      const filteredRequests = currentUser.notyfi.filter(
        (request) => !isAcceptedFriend(request.userId)
      );
      setFriendRequests(filteredRequests);
    }
  }, [currentUser]);

  const handleAccept = (userId: number) => {
    if (currentUser) {
      dispatch(
        acceptFriendRequest({
          currentUserId: currentUser.id,
          friendId: userId,
        })
      )
        .then(() => {
          message.success("Đã chấp nhận lời mời kết bạn");
          // Remove the accepted request from the local state
          setFriendRequests(
            friendRequests.filter((request) => request.userId !== userId)
          );
   
        })
        .catch((error: any) => {
          message.error(
            "Không thể chấp nhận lời mời kết bạn: " + error.message
          );
        });
    }
  };
  const handleDecline = (userId: number) => {
    if (currentUser) {
      dispatch(
        rejectFriendRequest({
          currentUserId: currentUser.id,
          friendId: userId,
        })
      )
        .then(() => {
          message.info("Đã từ chối lời mời kết bạn");
          
          // Xóa yêu cầu kết bạn khỏi danh sách hiển thị
          setFriendRequests(
            friendRequests.filter((request) => request.userId !== userId)
          );
  
          // Xóa thông báo khỏi notyfi của currentUser
          
        })
        .catch((error: any) => {
          message.error("Không thể từ chối lời mời kết bạn: " + error.message);
        });
    }
  };

  const getUserInfo = (userId: number) => {
    const user = allUsers.find((user) => user.id === userId);
    return user
      ? {
          name: user.name,
          avatar: user.avatar || undefined,
        }
      : {
          name: "Unknown User",
          avatar: undefined,
        };
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Title level={3}>
          <BellOutlined /> Lời mời kết bạn
        </Title>
      </div>

      {friendRequests.length === 0 ? (
        <Text>Không có lời mời kết bạn mới</Text>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={friendRequests}
          renderItem={(item) => {
            const userInfo = getUserInfo(item.userId);
            return (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleAccept(item.userId)}
                    style={{
                      marginRight: 8,
                      backgroundColor: "#FF69B4",
                      borderColor: "#FF69B4",
                    }}
                  >
                    Đồng ý
                  </Button>,
                  <Button onClick={() => handleDecline(item.userId)}>
                    Từ chối
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={userInfo.avatar}
                      icon={!userInfo.avatar && <UserOutlined />}
                      size={48}
                    />
                  }
                  title={
                    <div>
                      <UserAddOutlined
                        style={{ color: "#722ed1", marginRight: 8 }}
                      />
                      <Text strong>
                        {userInfo.name} {item.content}
                      </Text>
                    </div>
                  }
                  description={
                    <Text type="secondary">
                      {new Date(item.date).toLocaleString("vi-VN")}
                    </Text>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      <Divider />
    </div>
  );
};

export default Notify;

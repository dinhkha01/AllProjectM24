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
  const [notifications, setNotifications] = useState<notyfiType[]>([]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && currentUser.notyfi) {
      // Sắp xếp thông báo theo thời gian mới nhất
      const sortedNotifications = [...currentUser.notyfi].sort((a, b) => 
        new Date(b.add_at).getTime() - new Date(a.add_at).getTime()
      );
      setNotifications(sortedNotifications);
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
          setNotifications(notifications.filter((notif) => notif.userId !== userId));
        })
        .catch((error: any) => {
          message.error("Không thể chấp nhận lời mời kết bạn: " + error.message);
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
          setNotifications(notifications.filter((notif) => notif.userId !== userId));
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

  const renderNotificationActions = (notification: notyfiType) => {
    if (notification.content.includes("gửi lời mời kết bạn")) {
      return [
        <Button
          type="primary"
          onClick={() => handleAccept(notification.userId)}
          style={{
            marginRight: 8,
            backgroundColor: "#FF69B4",
            borderColor: "#FF69B4",
          }}
        >
          Đồng ý
        </Button>,
        <Button onClick={() => handleDecline(notification.userId)}>
          Từ chối
        </Button>,
      ];
    }
    return [];
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
          <BellOutlined /> Thông báo
        </Title>
      </div>

      {notifications.length === 0 ? (
        <Text>Không có thông báo mới</Text>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => {
            const userInfo = getUserInfo(item.userId);
            return (
              <List.Item actions={renderNotificationActions(item)}>
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
                      <Text strong>
                        {userInfo.name} {item.content}
                      </Text>
                    </div>
                  }
                  description={
                    <Text type="secondary">
                      {new Date(item.add_at).toLocaleString("vi-VN")}
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
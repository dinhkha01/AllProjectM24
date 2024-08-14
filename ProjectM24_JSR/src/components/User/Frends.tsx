import React, { useEffect, useState } from "react";
import { Card, Avatar, Button, Tabs, List, Typography, message, Input } from "antd";
import { UserOutlined, UserAddOutlined, SearchOutlined } from "@ant-design/icons";
import { users } from "../../config/interface";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  updateFriends,
  updateReceiverFriends,
  updateUserNotify,
} from "../../service/Login-Register/User";
import { RootState } from "../../store";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;
const { Title } = Typography;

const pinkColor = "#FF69B4";

const StyledTabs = styled(Tabs)`
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${pinkColor};
  }
  .ant-tabs-ink-bar {
    background-color: ${pinkColor};
  }
`;

const Friends = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allUsers = useSelector((state: RootState) => state.users.users);
  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser
  );

  const [friends, setFriends] = useState<users[]>([]);
  const [suggestions, setSuggestions] = useState<users[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<users[]>([]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && allUsers.length > 0) {
      const friendList = allUsers.filter((user: users) =>
        currentUser.friends?.some(
          (friend: any) =>
            friend.userId === user.id && friend.status === "accept"
        )
      );
      setFriends(friendList);

      const suggestionList = allUsers.filter(
        (user: users) =>
          user.id !== currentUser.id &&
          !currentUser.friends?.some((friend: any) => friend.userId === user.id)
      );
      setSuggestions(suggestionList);
    }
  }, [currentUser, allUsers]);


    const handleAddFriend = (event: React.MouseEvent, userId: number) => {
      event.stopPropagation();
      if (currentUser) {
        const newFriends = [
          ...(currentUser.friends || []),
          { userId: userId, status: "pending", add_at: new Date().toISOString() },
        ];
  
        dispatch(updateFriends(newFriends))
          .then(() => {
            message.success("Đã gửi lời mời kết bạn");
            setSuggestions(suggestions.filter((user) => user.id !== userId));
  
            // Cập nhật thông báo và bạn bè cho người dùng được mời kết bạn
            const targetUser = allUsers.find((user) => user.id === userId);
            if (targetUser) {
              const newNotify = [
                ...(targetUser.notyfi || []),
                {
                  status:false,
                  userId: currentUser.id,
                  content: ` đã gửi lời mời kết bạn`,
                  add_at: new Date().toISOString(),
                },
              ];
              dispatch(updateUserNotify({ userId, newNotify }));
  
              // Cập nhật danh sách bạn bè của người nhận
              const newReceiverFriends = [
                ...(targetUser.friends || []),
                {
                  userId: currentUser.id,
                  status: "pending",
                  add_at: new Date().toISOString(),
                },
              ];
              dispatch(
                updateReceiverFriends({ userId, newFriends: newReceiverFriends })
              );
            }
          })
          .catch((error: any) => {
            message.error("Không thể gửi lời mời kết bạn: " + error.message);
          });
      }
    };
  

  const handleUserClick = (userId: number) => {
    navigate(`/user/${userId}`);
  };

  const renderUserItem = (user: users, showAddButton: boolean = false) => (
    <List.Item
      onClick={() => handleUserClick(user.id)}
      style={{ cursor: "pointer" }}
      actions={
        showAddButton
          ? [
              <Button
                icon={<UserAddOutlined />}
                onClick={(e) => handleAddFriend(e, user.id)}
                style={{
                  backgroundColor: pinkColor,
                  borderColor: pinkColor,
                  color: "white",
                }}
              >
                Add Friend
              </Button>,
            ]
          : undefined
      }
    >
      <List.Item.Meta
        avatar={<Avatar src={user.avatar} icon={<UserOutlined />} />}
        title={user.name}
        description={user.email}
      />
    </List.Item>
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const results = allUsers.filter(
      (user) => user.name.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <Card>
      <StyledTabs defaultActiveKey="1">
        <TabPane tab="Bạn Bè" key="1">
          <Title level={4}>Your Friends</Title>
          <List
            itemLayout="horizontal"
            dataSource={friends}
            renderItem={(user) => renderUserItem(user)}
          />
        </TabPane>
        <TabPane tab="Gợi ý" key="2">
          <Title level={4}>Gợi ý bạn bè</Title>
          <List
            itemLayout="horizontal"
            dataSource={suggestions}
            renderItem={(user) => renderUserItem(user, true)}
          />
        </TabPane>
        <TabPane tab="Tìm kiếm" key="3">
          <Title level={4}>Tìm kiếm bạn bè</Title>
          <Input
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <List
            itemLayout="horizontal"
            dataSource={searchResults}
            renderItem={(user) => renderUserItem(user, !friends.some(friend => friend.id === user.id))}
          />
        </TabPane>
      </StyledTabs>
    </Card>
  );
};

export default Friends;
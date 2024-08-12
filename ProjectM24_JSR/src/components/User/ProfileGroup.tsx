import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Card,
  Tabs,
  Image,
  Button,
  Row,
  Col,
  Typography,
  Input,
  Upload,
  message,
  Modal,
  Form,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
  SendOutlined,
  EllipsisOutlined,
  UploadOutlined,
  CameraOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { RootState } from "../../store";
import { Group, users } from "../../config/interface";
import { storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";

import { createPost, getAllPost } from "../../service/Login-Register/Post";
import { addUserInGroup, createGroupPost, pushAvatar, pushCoverImg } from "../../service/Login-Register/Group";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Meta } = Card;

const ProfileGroup = () => {
  const dispatch = useDispatch();
  const { groupId } = useParams<{ groupId: string }>();
  const parsedGroupId = groupId ? parseInt(groupId, 10) : undefined;

  const allGroups = useSelector((state: RootState) => state.group.groups as Group[]);
  const allUsers = useSelector((state: RootState) => state.users.users as users[]);
  const currentUser = useSelector((state: RootState) => state.users.currentUser as users);
  const [groups, setGroups] = useState<Group | null>(allGroups.find((g) => g.id === parsedGroupId) || null);

  const group = allGroups.find((g) => g.id === parsedGroupId);
  const currentUserMember = group?.members.find(member => member.userId === currentUser.id);
  const isCreator = currentUserMember?.role === true;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [localAvatar, setLocalAvatar] = useState(group?.avatar);
const [localCoverImg, setLocalCoverImg] = useState(group?.coverimg);

useEffect(() => {
  const updatedGroup = allGroups.find((g) => g.id === parsedGroupId);
  if (updatedGroup) {
    setGroups(updatedGroup);
    setLocalAvatar(updatedGroup.avatar);
    setLocalCoverImg(updatedGroup.coverimg);
  }
}, [allGroups, parsedGroupId]);

  const sortedPosts = useMemo(() => {
    return [...(group?.postGroup || [])].sort(
      (a, b) => new Date(b.dateat).getTime() - new Date(a.dateat).getTime()
    );
  }, [group]);

  const isMember = group?.members.some((member) => member.userId === currentUser.id);

  const pinkButtonStyle = {
    backgroundColor: "#FF69B4",
    borderColor: "#FF69B4",
    color: "white",
  };

  const handleAvatarUpload = async (file: RcFile) => {
    if (!group) return;
    const imageRef = ref(storage, `group-avatars/${group.id}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
  
    dispatch(pushAvatar({ groupId: group.id, avatar: url }));
    setLocalAvatar(url); // Cập nhật state local
    message.success("Ảnh đại diện nhóm đã được cập nhật");
  };
  
  const handleCoverUpload = async (file: RcFile) => {
    if (!group) return;
    const imageRef = ref(storage, `group-covers/${group.id}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    
    dispatch(pushCoverImg({groupId: group.id, coverimg: url}));
    setLocalCoverImg(url); // Cập nhật state local
    message.success("Ảnh bìa nhóm đã được cập nhật");
  };
  const handlePostClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handlePostSubmit = async () => {
    try {
      if (!group?.id) {
        throw new Error("Group ID is missing");
      }
  
      // Validate form fields
      const { content } = await form.validateFields();
  
      // Upload images
      const imageUrls = await Promise.all(
        fileList.map(async (file) => {
          const imageRef = ref(storage, `group-posts/${group.id}/${file.uid}`);
          const snapshot = await uploadBytes(imageRef, file as RcFile);
          return getDownloadURL(snapshot.ref);
        })
      );
  
      // Prepare post data
      const postData = {
        content,
        img: imageUrls,
        userId: currentUser.id,
      };
  
      // Dispatch action to create post
      const result = await dispatch(createGroupPost({ groupId: group.id, postData }));
      
      if (createGroupPost.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
  
      // Success handling
      message.success("Bài viết đã được đăng thành công");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
  
    } catch (error) {
      // Error handling
      console.error("Error posting:", error);
      message.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng bài viết");
    }
  };
  
  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList((prevList) => [...prevList, file]);
      return false;
    },
    fileList,
  };
  const handleJoinGroup = async () => {
    if (group && currentUser) {
      try {
        await dispatch(addUserInGroup({ groupId: group.id, userId: currentUser.id }));
        message.success("Bạn đã tham gia nhóm thành công");
      } catch (error) {
        message.error("Có lỗi xảy ra khi tham gia nhóm");
      }
    }
  };

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div>
      <Card
        cover={
          <div
            style={{
              height: 300,
              background: "#f0f2f5",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Image
              alt="cover"
              src={localCoverImg || "https://via.placeholder.com/940x300"}
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            {isCreator && (
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleCoverUpload}
              >
                <Button
                  icon={<CameraOutlined />}
                  style={{
                    ...pinkButtonStyle,
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                  }}
                >
                  Chỉnh sửa ảnh bìa
                </Button>
              </Upload>
            )}
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "0 24px", position: "relative" }}>
          <div
            style={{ display: "flex", alignItems: "flex-end", marginTop: -90 }}
          >
            <div style={{ position: 'relative' }}>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                disabled={!isCreator}
              >
                <Avatar
                  size={180}
                  icon={<UserOutlined />}
                  src={localAvatar}
                  style={{
                    border: "4px solid white",
                    cursor: isCreator ? "pointer" : "default",
                  }}
                />
                {isCreator && (
                  <Button
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      ...pinkButtonStyle
                    }}
                    icon={<CameraOutlined />}
                    shape="circle"
                  />
                )}
              </Upload>
            </div>
            <div style={{ marginLeft: 24, marginBottom: 16 }}>
              <Title level={2} style={{ marginBottom: 4 }}>
                {group.groupName}
              </Title>
              <Text type="secondary">Thành viên: {group.members.length}</Text>
            </div>
          </div>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col>
              <Button style={pinkButtonStyle} onClick={handleJoinGroup}>
                {isMember ? "Đã tham gia" : "Tham gia nhóm"}
              </Button>
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey="1" style={{ padding: "0 16px" }}>
          <TabPane tab="Bài viết" key="1">
            {isMember && (
              <Card
                style={{ width: "100%", cursor: "pointer", marginBottom: 16 }}
                onClick={handlePostClick}
              >
                <Meta
                  avatar={<Avatar src={currentUser?.avatar} />}
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold" }}>
                        {currentUser?.name}, bạn đang nghĩ gì thế?
                      </span>
                      <PlusOutlined style={{ marginLeft: "auto" }} />
                    </div>
                  }
                />
              </Card>
            )}
            {sortedPosts.map((post, index) => {
              const postUser = allUsers.find((user) => user.id === post.userId);
              return (
                <Card
                  key={index}
                  style={{ width: "100%", marginBottom: 16 }}
                  actions={[
                    <div
                      key="like"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <HeartOutlined
                        style={{
                          fontSize: "20px",
                          marginRight: "5px",
                          color: "#FF69B4",
                        }}
                      />
                      <span style={{ color: "#FF69B4" }}>Thích</span>
                    </div>,
                    <div
                      key="comment"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MessageOutlined
                        style={{
                          fontSize: "20px",
                          marginRight: "5px",
                          color: "#FF69B4",
                        }}
                      />
                      <span style={{ color: "#FF69B4" }}>Bình luận</span>
                    </div>,
                    <div
                      key="share"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SendOutlined
                        style={{
                          fontSize: "20px",
                          marginRight: "5px",
                          color: "#FF69B4",
                        }}
                      />
                      <span style={{ color: "#FF69B4" }}>Chia sẻ</span>
                    </div>,
                  ]}
                >
                  <Meta
                    avatar={<Avatar src={postUser?.avatar} />}
                    title={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: "bold" }}>
                            {postUser?.name}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#65676B",
                              marginLeft: "8px",
                            }}
                          >
                            {new Date(post.dateat).toLocaleString()}
                          </span>
                        </div>
                        <EllipsisOutlined />
                      </div>
                    }
                  />
                  <div style={{ padding: "16px 0" }}>{post.content}</div>
                  {post.img.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <Image.PreviewGroup>
                        <div
                          style={{
                            display: "grid",
                            gridGap: "2px",
                            gridTemplateColumns: `repeat(${Math.min(
                              post.img.length,
                              3
                            )}, 1fr)`,
                          }}
                        >
                          {post.img.map((imageUrl, index) => (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                paddingTop: "100%",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                alt={`Post content ${index + 1}`}
                                src={imageUrl}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </Image.PreviewGroup>
                    </div>
                  )}
                  <Input
                    placeholder="Viết bình luận..."
                    prefix={
                      <Avatar
                        src={currentUser?.avatar}
                        size={24}
                        style={{ marginRight: "8px" }}
                      />
                    }
                    style={{
                      background: "#F0F2F5",
                      border: "none",
                      borderRadius: "20px",
                      padding: "8px 12px",
                      marginTop: "16px",
                    }}
                  />
                </Card>
              );
            })}
          </TabPane>
          <TabPane tab="Giới thiệu" key="2">
            <p>Thông tin giới thiệu về nhóm {group.groupName}</p>
          </TabPane>
          <TabPane tab="Thành viên" key="3">
            <p>Danh sách thành viên của nhóm {group.groupName}</p>
          </TabPane>
          <TabPane tab="Ảnh" key="4">
            <p>Ảnh của nhóm {group.groupName}</p>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Tạo bài viết mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} style={pinkButtonStyle}>
            Hủy
          </Button>,
          <Button
            key="submit"
            onClick={handlePostSubmit}
            style={pinkButtonStyle}
          >
            Đăng
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="content"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài viết" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nội dung bài viết" />
          </Form.Item>
          <Form.Item name="images">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} style={pinkButtonStyle}>
                Chọn ảnh
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileGroup;
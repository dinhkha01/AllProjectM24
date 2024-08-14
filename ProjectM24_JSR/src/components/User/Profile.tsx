import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Modal,
  Form,
  Upload,
  message,
  List,
  Radio,
  Divider,
  DatePicker,
  Menu,
  Badge,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  EllipsisOutlined,
  CameraOutlined,
  HeartOutlined,
  MessageOutlined,
  SendOutlined,
  PlusOutlined,
  UploadOutlined,
  CalendarOutlined,
  HomeOutlined,
  PhoneOutlined,
  HeartFilled,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { RootState } from "../../store";
import { createPost, getAllPost, deletePost, updatePostPrivacy, addCommentToPost, likePost, deleteComment } from "../../service/Login-Register/Post";
import { storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { addNotificationToUser, pushAvatar, pushBanner, pushInfor } from "../../service/Login-Register/User";
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Meta } = Card;

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.users.currentUser);
  const friendsUser = useSelector((state: RootState) => state.users.users);
  const posts = useSelector((state: RootState) => state.post.post);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState("");

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [currentPostImages, setCurrentPostImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllComments, setShowAllComments] = useState<{ [key: number]: boolean }>({});

  const handleCommentSubmit = (postId: number, content: string) => {
    if (content.trim() && user) {
      const newComment = {
        id: Date.now(),
        userId: user.id,
        content: content.trim(),
        date: new Date().toISOString(),
        reactions: []
      };

      dispatch(addCommentToPost({ postId, comment: newComment }));
      setCommentContent('');
      setShowAllComments(prev => ({ ...prev, [postId]: true }));

      // Find the post and its author
      const post = posts.find(p => p.id === postId);
      if (post && post.userId !== user.id) {
        // If the post author is not the current user, send a notification
        const notification = {
          status: false,
          userId: user.id,
          content: `đã bình luận về bài viết của bạn`,
          add_at: new Date().toISOString(),
        };
        dispatch(addNotificationToUser({ userId: post.userId, notification }));
      }
    }
  };

  const showEditModal = () => {
    const dobDayjs = user?.dob ? dayjs(user.dob, 'DD/MM/YY') : null;
    editForm.setFieldsValue({
      name: user?.name,
      dob: dobDayjs,
      phone: user?.phone,
      address: user?.address,
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      if (values.dob) {
        values.dob = dayjs(values.dob).format('DD/MM/YY');
      }
      dispatch(pushInfor(values));
      setIsEditModalVisible(false);
      message.success("Thông tin đã được cập nhật thành công");
    } catch (error) {
      console.error("Error updating user info:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  useEffect(() => {
    if (user?.id) {
      const userFriends = user.friends
        .map(friend => friendsUser.find(u => u.id === friend.userId))
        .filter((friend): friend is any => friend !== undefined);

      setFriends(userFriends);

      const userPhotos = posts
        .filter(post => post.userId === user.id && post.img.length > 0)
        .flatMap(post => post.img);
      setPhotos(userPhotos);
    }
  }, [user, posts, friendsUser]);

  const userPosts = posts.filter(post => post.userId === user?.id && post.status === true);
  const sortedPosts = useMemo(() => {
    return [...userPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [userPosts]);

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
      const values = await form.validateFields();
      const { content, privacy } = values;

      let imageUrls: string[] = [];

      for (const file of fileList) {
        const imageRef = ref(storage, `images/${file.name}`);
        const snapshot = await uploadBytes(imageRef, file as RcFile);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      const postData = {
        content,
        img: imageUrls,
        userId: user?.id,
        date: new Date().toISOString(),
        privacy,
        status: true,
        like: []
      };

      dispatch(createPost(postData));

      message.success("Bài viết đã được đăng thành công");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);

      dispatch(getAllPost());
    } catch (error) {
      console.error("Error posting:", error);
      message.error("Có lỗi xảy ra khi đăng bài viết");
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

  const handleAvatarUpload = async (file: RcFile) => {
    const imageRef = ref(storage, `avatars/${user?.id}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    dispatch(pushAvatar(url));
    message.success("Ảnh đại diện đã được cập nhật");
  };

  const handleBannerUpload = async (file: RcFile) => {
    const imageRef = ref(storage, `covers/${user?.id}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    dispatch(pushBanner(url));
    message.success("Ảnh bìa đã được cập nhật");
  };

  const handlePostOptionClick = (postId: number, option: string) => {
    switch (option) {
      case 'delete':
        handleDeletePost(postId);
        break;
      case 'privacy':
        handleUpdatePostPrivacy(postId);
        break;
      default:
        break;
    }
  };

  const handleDeletePost = async (postId: number) => {
    await dispatch(deletePost(postId));
    message.success('Bài viết đã được xóa thành công');
    dispatch(getAllPost());
    setOptionsModalVisible(false);
  };

  const handleUpdatePostPrivacy = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newPrivacy = post.privacy === 'public' ? 'private' : 'public';
      await dispatch(updatePostPrivacy({ postId, privacy: newPrivacy }));
      message.success('Trạng thái bài viết đã được cập nhật');
      dispatch(getAllPost());
      setOptionsModalVisible(false);
    }
  };

  const getUserAvatar = (userId: number) => {
    const commentUser = friendsUser.find(u => u.id === userId);
    return commentUser?.avatar || user?.avatar;
  };

  const getUserName = (userId: number) => {
    const commentUser = friendsUser.find(u => u.id === userId);
    return commentUser?.name || user?.name;
  };

  const handleLikeClick = (postId: number) => {
    if (user) {
      dispatch(likePost({ postId, userId: user.id }));
    }
  };

  const handlePreview = (imageUrl: string, postImages: string[]) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
    setCurrentPostImages(postImages);
    setCurrentImageIndex(postImages.indexOf(imageUrl));
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
    setCurrentImageIndex(0);
  };
  const handleDeleteComment = (postId: number, commentId: number) => {
    dispatch(deleteComment({ postId, commentId }))
      .unwrap()
      .then(() => {
        message.success("Bình luận đã được xóa thành công");
      })
      .catch(() => {
        message.error("Có lỗi xảy ra khi xóa bình luận");
      });
  };
  const pinkButtonStyle = {
    backgroundColor: "#FF69B4",
    borderColor: "#FF69B4",
    color: "white",
  };

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
              src={user?.banner || "https://via.placeholder.com/940x300"}
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleBannerUpload}
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
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "0 24px", position: "relative" }}>
          <div
            style={{ display: "flex", alignItems: "flex-end", marginTop: -90 }}
          >
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleAvatarUpload}
            >
              <Avatar
                size={180}
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{
                  border: "4px solid white",
                  cursor: "pointer",
                }}
              />
            </Upload>
            <div style={{ marginLeft: 24, marginBottom: 16 }}>
              <Title level={2} style={{ marginBottom: 4 }}>
                {user?.name}
              </Title>
              <Text type="secondary">{friends.length} bạn bè</Text>
            </div>
          </div>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col>
              <Button icon={<EditOutlined />} style={pinkButtonStyle} onClick={showEditModal}>
                Chỉnh sửa trang cá nhân
              </Button>
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey="1" style={{ padding: "0 16px" }}>
          <TabPane tab="Bài viết" key="1">
            <Card
              style={{ width: "100%", cursor: "pointer", marginBottom: 16 }}
              onClick={handlePostClick}
            >
              <Meta
                avatar={<Avatar src={user?.avatar} />}
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold" }}>
                      {user?.name}, bạn đang nghĩ gì thế?
                    </span>
                    <PlusOutlined style={{ marginLeft: "auto" }} />
                  </div>
                }
              />
            </Card>
            {sortedPosts.map((post) => (
              <Card
                key={post.id}
                style={{ width: "100%", marginBottom: 16, position: "relative" }}
                actions={[
                  <div
                    key="like"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: post.like.length > 0 ? "#FF69B4" : "inherit",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeClick(post.id);
                    }}
                  >
                    {user && post.like.some((like: { userId: number }) => like.userId === user.id) ? (
                      <HeartFilled style={{
                        fontSize: "20px",
                        marginRight: "5px",
                        color: "#FF69B4",
                      }} />
                    ) : (
                      <HeartOutlined style={{
                        fontSize: "20px",
                        marginRight: "5px",
                      }} />
                    )}
                    <span>Thích ({post.like.length})</span>
                  </div>,
                  <div
                    key="comment"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                    }}
                  >
                    <MessageOutlined
                      style={{
                        fontSize: "20px",
                        marginRight: "5px",
                        color: "#FF69B4",
                      }}
                    />
                    <span style={{ color: "#FF69B4", marginRight: "5px" }}>Bình luận</span>
                    <Badge
                      count={post.comments?.length || ""}
                      showZero
                      style={{ backgroundColor: '#FF69B4', marginLeft: '5px' }}
                    />
                  </div>,
                ]}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPostId(post.id);
                    setOptionsModalVisible(true);
                  }}
                >
                  <EllipsisOutlined style={{ fontSize: "20px" }} />
                </div>
                <Meta
                  avatar={<Avatar src={user?.avatar} />}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: "bold" }}>{user?.name}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#65676B",
                            marginLeft: "8px",
                          }}
                        >
                          {new Date(post.date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  }
                />
                <div style={{ padding: "16px 0" }}>{post.content}</div>
                {post.img.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <div
                      style={{
                        display: "grid",
                        gridGap: "2px",
                        gridTemplateColumns: `repeat(${Math.min(post.img.length, 3)}, 1fr)`,
                      }}
                    >
                      {post.img.map((imageUrl, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            paddingTop: "100%",
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                            handlePreview(imageUrl, post.img);
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
                  </div>
                )}
                {activeCommentPostId === post.id && (
                  <div style={{ marginTop: "16px" }}>
                    <List
                      itemLayout="horizontal"
                      dataSource={showAllComments[post.id] ? post.comments : post.comments?.slice(0, 3)}
                      renderItem={(comment) => (
                        <List.Item
                          actions={[
                            user?.id === post.userId && (
                              <Popconfirm
                                title="Bạn có chắc chắn muốn xóa bình luận này?"
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  handleDeleteComment(post.id, comment.id);
                                }}
                                okText="Có"
                                cancelText="Không"
                              >
                                <DeleteOutlined
                                  style={{ color: 'red', cursor: 'pointer' }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Popconfirm>
                            ),
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar src={getUserAvatar(comment.userId)} />}
                            title={getUserName(comment.userId)}
                            description={comment.content}
                          />
                        </List.Item>
                      )}
                    />
                    {!showAllComments[post.id] && post.comments && post.comments.length > 3 && (
                      <Button
                        type="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllComments(prev => ({ ...prev, [post.id]: true }));
                        }}
                      >
                        Xem thêm {post.comments.length - 3} bình luận
                      </Button>
                    )}
                  </div>
                )}
                <Input
                  placeholder="Viết bình luận..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  prefix={
                    <Avatar
                      src={user?.avatar}
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
                  onPressEnter={() => {
                    handleCommentSubmit(post.id, commentContent);
                  }}
                />
              </Card>
            ))}
          </TabPane>

          <TabPane tab="Giới thiệu" key="2">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card>
                  <Typography.Title level={4}>Thông tin cá nhân</Typography.Title>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <List
                        itemLayout="horizontal"
                        dataSource={[
                          {
                            title: "Họ và tên",
                            description: user?.name,
                            icon: <UserOutlined style={{ fontSize: '24px', color: '#FF69B4' }} />
                          },
                          {
                            title: "Ngày sinh",
                            description: user?.dob,
                            icon: <CalendarOutlined style={{ fontSize: '24px', color: '#FF69B4' }} />
                          }
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<div style={{ marginTop: '8px' }}>{item.icon}</div>}
                              title={<Typography.Text strong>{item.title}</Typography.Text>}
                              description={item.description}
                            />
                          </List.Item>
                        )}
                      />
                    </Col>
                    <Col span={12}>
                      <List
                        itemLayout="horizontal"
                        dataSource={[
                          {
                            title: "Số điện thoại",
                            description: user?.phone,
                            icon: <PhoneOutlined style={{ fontSize: '24px', color: '#FF69B4' }} />
                          },
                          {
                            title: "Địa chỉ",
                            description: user?.address,
                            icon: <HomeOutlined style={{ fontSize: '24px', color: '#FF69B4' }} />
                          },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<div style={{ marginTop: '8px' }}>{item.icon}</div>}
                              title={<Typography.Text strong>{item.title}</Typography.Text>}
                              description={item.description}
                            />
                          </List.Item>
                        )}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Bạn bè" key="3">
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={friends}
              renderItem={(friend) => (
                <List.Item>
                  <Card>
                    <Card.Meta
                      avatar={<Avatar src={friend.avatar} />}
                      title={friend.name}
                    />
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab="Ảnh" key="4">
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={photos}
              renderItem={(photo) => (
                <List.Item>
                  <Image
                    src={photo}
                    alt={`Photo`}
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                </List.Item>
              )}
            />
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
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="privacy" initialValue="public">
            <Radio.Group>
              <Radio value="public">Công khai</Radio>
              <Radio value="private">Riêng tư</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button key="cancel" onClick={handleEditCancel} style={pinkButtonStyle}>
            Hủy
          </Button>,
          <Button
            key="submit"
            onClick={handleEditSubmit}
            style={pinkButtonStyle}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YY"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={optionsModalVisible}
        onCancel={() => setOptionsModalVisible(false)}
        footer={null}
      >
        <Menu
          onClick={({ key }) => {
            if (selectedPostId) {
              handlePostOptionClick(selectedPostId, key);
            }
          }}
          items={[
            {
              key: 'privacy',
              label: selectedPostId && posts.find(p => p.id === selectedPostId)?.privacy === "public"
                ? "Đổi trạng thái thành riêng tư"
                : "Đổi trạng thái thành công khai"
            },
            { key: 'delete', label: 'Xóa bài viết' },
          ]}
        />
      </Modal>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={handlePreviewClose}
        width="50%"
      >
        <div style={{ position: "relative" }}>
          <Image src={currentPostImages[currentImageIndex]} width="100%" />
          {currentImageIndex > 0 && (
            <Button
              style={{ position: "absolute", top: "50%", left: "10px" }}
              onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
              icon={<LeftOutlined />}
            />
          )}
          {currentImageIndex < currentPostImages.length - 1 && (
            <Button
              style={{ position: "absolute", top: "50%", right: "10px" }}
              onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
              icon={<RightOutlined />}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
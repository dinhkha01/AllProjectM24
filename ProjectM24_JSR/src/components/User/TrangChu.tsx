import React, { useEffect, useState, useMemo } from "react";
import {
  EllipsisOutlined,
  HeartOutlined,
  MessageOutlined,
  SendOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Card,
  Input,
  Modal,
  Button,
  Form,
  Upload,
  message,
  Image,
} from "antd";
import { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { getAllPost, createPost } from "../../service/Login-Register/Post";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../config/firebase";
import { getAllUsers } from "../../service/Login-Register/User";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const TrangChu = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [currentPostImages, setCurrentPostImages] = useState<string[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const posts = useSelector((state: RootState) => state.post.post);

  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser
  );

  const users = useSelector((state: RootState) => state.users.users);

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [posts]);

  const getUserName = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : "Người dùng ẩn danh";
  };

  const getUserAvatar = (userId: number) => {
    const user = users.find((user) => user.id === userId);
    return user && user.avatar ? user.avatar : "https://via.placeholder.com/32";
  };

  useEffect(() => {
    dispatch(getAllPost());
    dispatch(getAllUsers());
  }, [dispatch]);

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
      const { content } = values;

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
        userId: currentUser?.id,
        date: new Date().toISOString(),
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

  const handlePreview = (imageUrl: string, postImages: string[]) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
    setCurrentPostImages(postImages);
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
  };

  const handleAvatarClick = (clickedUserId: number | undefined) => {
    if (clickedUserId === undefined) return;

    if (currentUser && clickedUserId === currentUser.id) {
      navigate("/profile");
    } else {
      navigate(`/user/${clickedUserId}`);
    }
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        maxWidth: "680px",
        margin: "0 auto",
      }}
    >
      <Card
        style={{ width: "100%", cursor: "pointer" }}
        onClick={handlePostClick}
      >
        <Meta
          avatar={
            <Avatar
              src={currentUser?.avatar}
              onClick={(e) => {
                handleAvatarClick(currentUser?.id);
              }}
              style={{ cursor: "pointer" }}
            />
          }
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

      {sortedPosts.map((post) => (
        <Card
          key={post.id}
          style={{ width: "100%" }}
          actions={[
            <div
              key="like"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HeartOutlined style={{ fontSize: "20px", marginRight: "5px" }} />
              <span>Thích</span>
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
                style={{ fontSize: "20px", marginRight: "5px" }}
              />
              <span>Bình luận</span>
            </div>,
            <div
              key="share"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SendOutlined style={{ fontSize: "20px", marginRight: "5px" }} />
              <span>Chia sẻ</span>
            </div>,
          ]}
        >
          <Meta
            avatar={
              <Avatar
                src={getUserAvatar(post.userId)}
                onClick={(e: any) => {
                  e.stopPropagation();
                  handleAvatarClick(post.userId);
                }}
                style={{ cursor: "pointer" }}
              />
            }
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
                    {getUserName(post.userId)}
                  </span>
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
                <EllipsisOutlined />
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
                        cursor: "pointer",
                      }}
                      onClick={() => handlePreview(imageUrl, post.img)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <Input
            placeholder="Viết bình luận..."
            prefix={
              <Avatar
                src={currentUser?.avatar}
                size={24}
                style={{ marginRight: "8px", cursor: "pointer" }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  handleAvatarClick(currentUser?.id);
                }}
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
      ))}

      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: handlePreviewClose,
        }}
      />

      <Modal
        title="Tạo bài viết mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handlePostSubmit}>
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
        </Form>
      </Modal>
    </div>
  );
};

export default TrangChu;

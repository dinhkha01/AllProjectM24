import {
  EllipsisOutlined,
  HeartOutlined,
  MessageOutlined,
  PlusOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Form,
  Image,
  Input,
  Menu,
  Modal,
  Radio,
  Upload,
  message,
} from "antd";
import { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { storage } from "../../config/firebase";
import { createPost, deletePost, getAllPost, updatePostPrivacy } from "../../service/Login-Register/Post";
import { getAllUsers } from "../../service/Login-Register/User";
import { RootState } from "../../store";

const { Meta } = Card;

const TrangChu = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [currentPostImages, setCurrentPostImages] = useState<string[]>([]);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const posts = useSelector((state: RootState) => state.post.post);
  const currentUser = useSelector((state: RootState) => state.users.currentUser);
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

  const handlePostClick = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (post && (post.privacy === 'public' || post.userId === currentUser?.id)) {
      // Hiển thị chi tiết bài viết
    } else {
      message.error('Bạn không có quyền xem chi tiết bài viết này.');
    }
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
        userId: currentUser?.id,
        date: new Date().toISOString(),
        privacy,
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
    try {
      await dispatch(deletePost(postId));
      message.success('Bài viết đã được xóa thành công');
      dispatch(getAllPost());
      setOptionsModalVisible(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      message.error('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const handleUpdatePostPrivacy = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const newPrivacy = post.privacy === 'public' ? 'private' : 'public';
        await dispatch(updatePostPrivacy({ postId, privacy: newPrivacy }));
        message.success('Trạng thái bài viết đã được cập nhật');
        dispatch(getAllPost());
        setOptionsModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating post privacy:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái bài viết');
    }
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
        onClick={() => setIsModalVisible(true)}
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

      {sortedPosts
        .filter((post) => post.privacy === 'public' || post.userId === currentUser?.id)
        .map((post) => (
          <Card
            key={post.id}
            style={{ width: "100%", position: "relative" }}
            onClick={() => handlePostClick(post.id)}
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
            {currentUser?.id === post.userId && (
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
            )}
            
            <Meta
              avatar={<Avatar src={getUserAvatar(post.userId)}  />}
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "bold" }}>{getUserName(post.userId)}</span>
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
            <div>
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
            </div>
          </Card>
        ))}

      <Modal
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handlePostSubmit}
        title="Tạo bài viết mới"
        okText="Đăng bài"
        cancelText="Hủy"
      >
        <Form form={form}>
          <Form.Item
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung bài viết" }]}
          >
            <Input.TextArea placeholder="Bạn đang nghĩ gì?" />
          </Form.Item>
          <Form.Item
            name="privacy"
            rules={[{ required: true, message: "Vui lòng chọn quyền riêng tư" }]}
          >
            <Radio.Group>
              <Radio value="public">Công khai</Radio>
              <Radio value="private">Riêng tư</Radio>
            </Radio.Group>
          </Form.Item>
          <Upload {...uploadProps} listType="picture-card">
            {fileList.length < 8 && <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>}
          </Upload>
        </Form>
      </Modal>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={handlePreviewClose}
      >
        <Image src={previewImage} width="100%" />
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
    </div>
  );
};

export default TrangChu;
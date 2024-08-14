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
  message,
  List,
  Badge,
  Modal,
} from "antd";
import {
  UserOutlined,
  HeartOutlined,
  MessageOutlined,
  SendOutlined,
  EllipsisOutlined,
  HeartFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { RootState } from "../../store";
import { post, users } from "../../config/interface";
import {
  addNotificationToUser,
  rejectFriendRequest,
  updateFriends,
  updateReceiverFriends,
  updateUserNotify,
} from "../../service/Login-Register/User";
import { addCommentToPost, likePost } from "../../service/Login-Register/Post";

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Meta } = Card;

const ProfileUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = userId ? parseInt(userId, 10) : undefined;
  const dispatch = useDispatch();

  const allUsers = useSelector(
    (state: RootState) => state.users.users as users[]
  );
  const posts = useSelector((state: RootState) => state.post.post as post[]);
  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser as users
  );

  const user = allUsers.find((u) => u.id === parsedUserId);
  const [friends, setFriends] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [currentPostImages, setCurrentPostImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllComments, setShowAllComments] = useState<{ [key: number]: boolean }>({});

  const handleCommentSubmit = (postId: number, content: string) => {
    if (content.trim() && currentUser) {
      const newComment = {
        id: Date.now(),
        userId: currentUser.id,
        content: content.trim(),
        date: new Date().toISOString(),
        reactions: []
      };
  
      dispatch(addCommentToPost({ postId, comment: newComment }));
      setCommentContent('');
      setShowAllComments(prev => ({ ...prev, [postId]: true }));
  
      // Find the post and its author
      const post = posts.find(p => p.id === postId);
      if (post && post.userId !== currentUser.id) {
        // If the post author is not the current user, send a notification
        const notification = {
          status: false,
          userId: currentUser.id,
          content: `đã bình luận về bài viết của bạn`,
          add_at: new Date().toISOString(),
        };
        dispatch(addNotificationToUser({ userId: post.userId, notification }));
      }
    }
  };

  const getUserAvatar = (userId: number) => {
    const commentUser = allUsers.find(u => u.id === userId);
    return commentUser?.avatar || currentUser?.avatar;
  };

  const getUserName = (userId: number) => {
    const commentUser = allUsers.find(u => u.id === userId);
    return commentUser?.name || currentUser?.name;
  };

  const userPosts = posts.filter((post) => post.userId === user?.id);

  useEffect(() => {
    if (user?.id) {
      const userFriends = user.friends
        .map(friend => allUsers.find(u => u.id === friend.userId))
        .filter((friend): friend is users => friend !== undefined);

      setFriends(userFriends);

      const userPhotos = posts
        .filter(post => post.userId === user.id && post.img.length > 0)
        .flatMap(post => post.img);
      setPhotos(userPhotos);
    }
  }, [user, posts, allUsers]);

  const sortedPosts = useMemo(() => {
    return [...userPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [userPosts]);

  const isFriend = currentUser?.friends?.some(
    (friend) => friend.userId === user?.id && friend.status === "accept"
  );

  const isPendingFriend = currentUser?.friends?.some(
    (friend) => friend.userId === user?.id && friend.status === "pending"
  );

  const pinkButtonStyle = {
    backgroundColor: "#FF69B4",
    borderColor: "#FF69B4",
    color: "white",
  };
  const unfriendButtonStyle = {
    backgroundColor: "#f0f2f5",
    borderColor: "#d3d5d8",
    color: "#65676B",
  };

  const handleUnfriend = (userId: number) => {
    if (currentUser) {
      dispatch(
        rejectFriendRequest({
          currentUserId: currentUser.id,
          friendId: userId,
        })
      )
        .then(() => {
          message.success("Đã hủy kết bạn");
          dispatch({
            type: "UPDATE_FRIEND_STATUS",
            payload: {
              currentUserId: currentUser.id,
              friendId: userId,
              status: "unfriend",
            },
          });
        })
        .catch((error: any) => {
          message.error("Không thể hủy kết bạn: " + error.message);
        });
    }
  };

  const handleAddFriend = (event: React.MouseEvent) => {
    event.preventDefault();
    if (currentUser && user) {
      const newFriends = [
        ...(currentUser.friends || []),
        { userId: user.id, status: "pending", add_at: new Date().toISOString() },
      ];

      dispatch(updateFriends(newFriends))
        .then(() => {
          message.success("Đã gửi lời mời kết bạn");

          const newNotify = [
            ...(user.notyfi || []),
            {
              status:false,
              userId: currentUser.id,
              content: ` đã gửi lời mời kết bạn`,
              add_at: new Date().toISOString(),
            },
          ];
          dispatch(updateUserNotify({ userId: user.id, newNotify }));

          const newReceiverFriends = [
            ...(user.friends || []),
            {
              userId: currentUser.id,
              status: "pending",
              add_at: new Date().toISOString(),
            },
          ];
          dispatch(
            updateReceiverFriends({ userId: user.id, newFriends: newReceiverFriends })
          );
        })
        .catch((error: any) => {
          message.error("Không thể gửi lời mời kết bạn: " + error.message);
        });
    }
  };

  const handleLikeClick = (postId: number) => {
    if (currentUser) {
      dispatch(likePost({ postId, userId: currentUser.id }));
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

  if (!user) {
    return <div>User not found</div>;
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
              src={user.banner || "https://via.placeholder.com/940x300"}
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "0 24px", position: "relative" }}>
          <div
            style={{ display: "flex", alignItems: "flex-end", marginTop: -90 }}
          >
            <Avatar
              size={180}
              src={user.avatar}
              icon={<UserOutlined />}
              style={{
                border: "4px solid white",
              }}
            />
            <div style={{ marginLeft: 24, marginBottom: 16 }}>
              <Title level={2} style={{ marginBottom: 4 }}>
                {user.name}
              </Title>
              <Text type="secondary">Bạn bè: {user.friends.length}</Text>
            </div>
          </div>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col>
              {isFriend ? (
                <>
                  <Button style={pinkButtonStyle}>Bạn bè</Button>

                  <Button
                    style={pinkButtonStyle}
                    onClick={() => handleUnfriend(user.id)}
                    className="ml-2"
                  >
                    Hủy kết bạn
                  </Button>
                </>
              ) : isPendingFriend ? (
                <Button style={unfriendButtonStyle} disabled>
                  Đang chờ xác nhận
                </Button>
              ) : (
                <Button style={pinkButtonStyle} onClick={handleAddFriend}>
                  Kết bạn
                </Button>
              )}
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey="1" style={{ padding: "0 16px" }}>
        <TabPane tab="Bài viết" key="1">
          {sortedPosts
            .filter(post => 
              post.status && 
              post.privacy === "public" &&
              (post.userId === user?.id || isFriend || post.userId === currentUser?.id)
            )
            .map((post) => (
              <Card
                key={post.id}
                style={{ width: "100%", marginBottom: 16 }}
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
                  {currentUser && post.like.some((like: { userId: number }) => like.userId === currentUser.id) ? (
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
                <Meta
                  avatar={<Avatar src={user.avatar} />}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: "bold" }}>{user.name}</span>
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
        <List.Item>
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
                  onPressEnter={() => {
                    handleCommentSubmit(post.id, commentContent);
                  }}
                />
              </Card>
            ))}
        </TabPane>
          <TabPane tab="Giới thiệu" key="2">
            <p>Thông tin giới thiệu về {user.name}</p>
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

export default ProfileUser;
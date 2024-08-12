import { TeamOutlined, SearchOutlined, LockOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Input, List, Tabs, Space, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Group as Groupp } from "../../config/interface";
import { allGroups, createGroup } from "../../service/Login-Register/Group";
import { getAllUsers } from "../../service/Login-Register/User";
import { RootState } from "../../store";

const { TabPane } = Tabs;

const Group = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser
  );
  const allGroup = useSelector((state: RootState) => state.group.groups);
  const [newGroupName, setNewGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(allGroups());
  }, [dispatch]);

  const filteredGroups = allGroup.filter(group => 
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myGroups = filteredGroups.filter((group) =>
    group.members.some((member) => member.userId === currentUser?.id)
  );

  const suggestedGroups = filteredGroups.filter(
    (group) =>
      !group.members.some((member) => member.userId === currentUser?.id)
  );

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const userId = currentUser?.id;
      const newGroup = {
        groupName: newGroupName,
        avatar: "",
        coverimg: "",
        dateAt: new Date().toISOString(),
        members: [{
          userId: userId,
          role: true,
          dateJoin: new Date().toISOString()
        }],
        postGroup: [],
        status: true,
      };
      dispatch(createGroup(newGroup));
      setNewGroupName("");
    }
  };

  const handleGroupClick = (group: Groupp) => {
    if (group.status) {
      navigate(`/group/${group.id}`);
    } else {
      message.error("Nhóm này đã bị khóa và không thể truy cập.");
    }
  };

  const renderGroupCard = (group: Groupp) => (
    <Card
      hoverable
      onClick={() => handleGroupClick(group)}
      cover={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', position: 'relative' }}>
          <Avatar 
            size={64} 
            src={group.avatar} 
            alt={group.groupName}
          />
        </div>
      }
      style={{ position: 'relative' }}
    >
      <Card.Meta
        title={group.groupName}
        description={`${group.members.length} thành viên`}
      />
      {!group.status && (
        <Tooltip title="Nhóm này đã bị khóa">
          <LockOutlined 
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.65)',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              padding: '4px'
            }}
          />
        </Tooltip>
      )}
    </Card>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm nhóm"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Space>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Nhóm của tôi" key="1">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={myGroups}
            renderItem={renderGroupCard}
          />
        </TabPane>
        <TabPane tab="Nhóm gợi ý" key="2">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={suggestedGroups}
            renderItem={renderGroupCard}
          />
        </TabPane>
        <TabPane tab="Tạo nhóm mới" key="3">
          <Card>
            <Input
              placeholder="Nhập tên nhóm mới"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" onClick={handleCreateGroup}>
              Tạo nhóm
            </Button>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Group;
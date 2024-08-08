import { TeamOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Input, List, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {  Group as Groupp } from "../../config/interface";
import { allGroups, createGroup } from "../../service/Login-Register/Group";
import { getAllUsers } from "../../service/Login-Register/User";
import { RootState } from "../../store";

// const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Group = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser
  );
  const allGroup = useSelector((state: RootState) => state.group.groups);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(allGroups());
  }, [dispatch]);

  const myGroups = allGroup.filter((group) =>
    group.members.some((member) => member.userId === currentUser?.id)
  );

  const suggestedGroups = allGroup.filter(
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
        members: [{
          userId: userId,
          role:true,
          dateJoin:new Date().toISOString()

        }],
        postGroup: [],
      };
      dispatch(createGroup(newGroup));
      setNewGroupName("");
    }
  };

  const handleGroupClick = (groupId: number) => {
    navigate(`/group/${groupId}`);
  };

  const renderGroupCard = (group: Groupp) => (
    <Card
      hoverable
      onClick={() => handleGroupClick(group.id)}
      cover={ <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
      <Avatar 
        size={64} 
        src={group.avatar} 
        alt={group.groupName}
      />
    </div>}
    >
      <Card.Meta
        title={group.groupName}
        description={`${group.members.length} members`}
      />
    </Card>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="My Groups" key="1">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={myGroups}
            renderItem={renderGroupCard}
          />
        </TabPane>
        <TabPane tab="Suggested Groups" key="2">
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={suggestedGroups}
            renderItem={renderGroupCard}
          />
        </TabPane>
        <TabPane tab="Create Group" key="3">
          <Card>
            <Input
              placeholder="Enter new group name "
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" onClick={()=>handleCreateGroup()}>
              Create Group
            </Button>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Group;

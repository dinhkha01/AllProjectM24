import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Avatar, Input, Space, Modal, List, Typography } from 'antd';
import { SearchOutlined, UserOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { allGroups } from '../../service/Login-Register/Group';
import { ColumnsType } from 'antd/es/table';
import { Group, GroupMember } from '../../config/interface';
import { getAllUsers } from '../../service/Login-Register/User';

const { Text } = Typography;

const AdminGroup = () => {
  const dispatch: AppDispatch = useDispatch();
  const groups = useSelector((state: RootState) => state.group.groups);
  const users = useSelector((state: RootState) => state.users.users);
  console.log(users);
  
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(allGroups());
    dispatch(getAllUsers());
  }, [dispatch]);

  const getOwnerName = (ownerId: number) => {
    const owner = users.find(user => user.id === ownerId);
    return owner ? owner.name : 'Unknown';
  };

  const handleDeleteGroup = (groupId: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this group?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Implement the actual deletion logic here
        console.log('Deleting group with ID:', groupId);
        // You might want to dispatch an action to delete the group from your Redux store
        // and/or make an API call to delete the group from the backend
      },
    });
  };

  const columns: ColumnsType<Group> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'GROUP NAME',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (name, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'OWNER',
      dataIndex: 'members',
      key: 'owner',
      render: (members: GroupMember[]) => {
        const owner = members.find(member => member.role === true);
        const ownerUser = users.find(user => user.id === owner?.userId);
        return (
          <Space>
            <Avatar src={ownerUser?.avatar} icon={<UserOutlined />} />
            <span>{ownerUser ? ownerUser.name : 'Unknown'}</span>
          </Space>
        );
      },
    },
    {
      title: 'CREATED AT',
      dataIndex: 'dateAt',
      key: 'dateAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'MEMBERS',
      dataIndex: 'members',
      key: 'members',
      render: (members: GroupMember[]) => members.length,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? <><UnlockOutlined /> UNLOCKED</> : <><LockOutlined /> LOCKED</>}
        </Tag>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => handleDeleteGroup(record.id)}
            type="primary"
            danger
            icon={<DeleteOutlined />}
            style={{
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Delete
          </Button>
          <Button 
            type="primary" 
            icon={record.status ? <LockOutlined /> : <UnlockOutlined />}
            style={{
              backgroundColor: record.status ? '#52c41a' : '#faad14',
              borderColor: record.status ? '#52c41a' : '#faad14',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {record.status ? 'Lock' : 'Unlock'}
          </Button>
        </Space>
      ),
    },
  ];

  const filteredGroups = groups.filter(group => 
    group.groupName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <h3 style={{ 
          color: '#fff', 
          background: '#4caf50', 
          padding: '15px', 
          borderRadius: '8px 8px 0 0', 
          marginTop: '-20px', 
          marginLeft: '-20px', 
          marginRight: '-20px' 
        }}>
          Groups Management
        </h3>
        <Input
          placeholder="Search groups"
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table 
          columns={columns} 
          dataSource={filteredGroups}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default AdminGroup;
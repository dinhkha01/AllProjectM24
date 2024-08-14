import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Avatar, Input, Space, Modal } from 'antd';
import { UserOutlined, SearchOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { banOrUnban, deleteUser, getAllUsers } from '../../service/Login-Register/User';
import { ColumnsType } from 'antd/es/table';
import { users } from '../../config/interface';

const AdminUsers = () => {
  const dispatch: AppDispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDeleteUser = (userId: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch(deleteUser(userId));
        dispatch(getAllUsers());
      },
    });
  };

  const banOrUnnban = (userId: number, status: boolean) => {
    dispatch(banOrUnban({ userId, status }));
    dispatch(getAllUsers());
  };

  const columns: ColumnsType<users> = [
    {
      title: 'USER',
      dataIndex: 'name',
      key: 'name',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record: users) => {
        if (typeof value === 'string') {
          return record.name.toLowerCase().includes(value.toLowerCase()) ||
                 record.email.toLowerCase().includes(value.toLowerCase());
        }
        return false;
      },
      render: (_, record: users) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <span>{record.name}</span>
        </Space>
      ),
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'ACTIVE' : 'BANNED'}
        </Tag>
      ),
    },
    {
      title: 'date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_: any, record: users) => (
        <Space>
          <Button 
            type="primary" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          >
            Delete
          </Button>
          <Button 
            type={record.status ? "default" : "primary"}
            icon={record.status ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => banOrUnnban(record.id, !record.status)}
          >
            {record.status ? 'Ban' : 'Unban'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <h3 style={{ 
          color: '#fff', 
          background: '#e91e63', 
          padding: '15px', 
          borderRadius: '8px 8px 0 0', 
          marginTop: '-20px', 
          marginLeft: '-20px', 
          marginRight: '-20px' 
        }}>
          Users Table
        </h3>
        <Input
          placeholder="Search users"
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
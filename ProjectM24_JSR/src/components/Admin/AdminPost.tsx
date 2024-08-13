import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Avatar, Input, Space } from 'antd';
import { SearchOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { deletePost, getAllPost, switchStatus,  } from '../../service/Login-Register/Post';
import { ColumnsType } from 'antd/es/table';
import { post } from '../../config/interface';

const AdminPost = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.post.post);
  const users = useSelector((state: RootState) => state.users.users);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(getAllPost());
  }, [dispatch]);

  const handleToggleStatus = (postId: number, status: boolean) => {
    dispatch(switchStatus({ postId, status }));
    dispatch(getAllPost())
  };

const deletePostt =(postId: number)=>{
  dispatch(deletePost(postId))
  dispatch(getAllPost())
}
  

  const getUserInfo = (userId: number) => {
    return users.find(user => user.id === userId) || { name: 'Unknown', avatar: '' };
  };

  const columns: ColumnsType<post> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'USER',
      key: 'user',
      render: (_, record: post) => {
        const user = getUserInfo(record.userId);
        return (
          <Space>
            <Avatar src={user.avatar} />
            <span>{user.name}</span>
          </Space>
        );
      },
    },
    {
      title: 'CONTENT',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => 
        content.length > 50 ? `${content.substring(0, 50)}...` : content,
    },
    {
      title: 'IMAGE',
      key: 'image',
      render: (_, record: post) => 
        record.img && record.img.length > 0 ? (
          <Avatar shape="square" size={50} src={record.img[0]} />
        ) : null,
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'VISIBLE' : 'HIDDEN'}
        </Tag>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record: post) => (
        <Space>
          <Button 
            type={record.status ? 'default' : 'primary'}
            onClick={() => handleToggleStatus(record.id, !record.status)}
            style={{
              borderRadius: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 15px',
            }}
            icon={record.status ? <LockOutlined /> : <UnlockOutlined />}
          >
            {record.status ? 'Hide Post' : 'Show Post'}
          </Button>
          <Button 
            type="primary"
            danger
            style={{
              borderRadius: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 15px',
            }}
            onClick={()=>deletePostt(record.id)}
            icon={<DeleteOutlined />}
          >
            Delete
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
          background: '#2196f3', 
          padding: '15px', 
          borderRadius: '8px 8px 0 0', 
          marginTop: '-20px', 
          marginLeft: '-20px', 
          marginRight: '-20px' 
        }}>
          Posts Table
        </h3>
        <Input
          placeholder="Search posts"
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table 
          columns={columns} 
          dataSource={posts.filter(post => 
            post.content.toLowerCase().includes(searchText.toLowerCase()) ||
            getUserInfo(post.userId).name.toLowerCase().includes(searchText.toLowerCase())
          )}
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

export default AdminPost;
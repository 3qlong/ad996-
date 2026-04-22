import { useEffect, useState } from 'react';
import {
  Button, Card, Space, Tag, Modal, Form, Input, Select,
  message, Popconfirm, Typography, Table, Avatar,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser } from '../api/client';

const { Title } = Typography;

interface User {
  id: number; username: string; email: string;
  role: string; status: string; created_at: string; last_login_at: string | null;
}

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res: any = await getUsers({ page, page_size: 20 });
    setData(res.items);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (row: User) => { setEditing(row); form.setFieldsValue(row); setModalOpen(true); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateUser(editing.id, values);
      message.success('用户已更新');
    } else {
      await createUser(values);
      message.success('用户已创建');
    }
    setModalOpen(false);
    load();
  };

  const columns = [
    {
      title: '用户', key: 'user',
      render: (_: any, row: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: row.role === 'admin' ? '#22c65e' : '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 600 }}>{row.username}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{row.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色', dataIndex: 'role', key: 'role', width: 90,
      render: (r: string) => <Tag color={r === 'admin' ? 'green' : 'blue'}>{r === 'admin' ? '管理员' : '普通用户'}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '正常' : '封禁'}</Tag>,
    },
    { title: '注册时间', dataIndex: 'created_at', key: 'created_at', width: 110, render: (t: string) => t.slice(0, 10) },
    { title: '最近登录', dataIndex: 'last_login_at', key: 'last_login_at', width: 110, render: (t: string | null) => t ? t.slice(0, 10) : '从未登录' },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, row: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="确认删除该用户？" onConfirm={async () => { await deleteUser(row.id); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>用户管理 <span style={{ fontSize: 14, color: '#999', fontWeight: 400 }}>共 {total} 人</span></Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增用户</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize: 20, total, onChange: setPage }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select options={[{ label: '普通用户', value: 'user' }, { label: '管理员', value: 'admin' }]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ label: '正常', value: 'active' }, { label: '封禁', value: 'banned' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  Button, Card, Space, Switch, Modal, Form, Input, InputNumber,
  message, Popconfirm, Typography, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import DraggableTable, { DragHandle } from '../components/DraggableTable';
import {
  getNavSites, createNavSite, updateNavSite, deleteNavSite, updateNavSiteSort,
} from '../api/client';

const { Title } = Typography;

interface NavSite { id: number; name: string; icon: string; url: string; sort_order: number; visible: boolean; }

export default function NavSitesPage() {
  const [data, setData] = useState<NavSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NavSite | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res: any = await getNavSites();
    setData(res);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ visible: true, sort_order: data.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (row: NavSite) => { setEditing(row); form.setFieldsValue(row); setModalOpen(true); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateNavSite(editing.id, values);
      message.success('站点已更新');
    } else {
      await createNavSite(values);
      message.success('站点已添加');
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteNavSite(id);
    message.success('已删除');
    load();
  };

  const handleSortEnd = async (newItems: NavSite[]) => {
    setData(newItems);
    await updateNavSiteSort(newItems.map((s, i) => ({ id: s.id, sort_order: i + 1 })));
    message.success('排序已保存');
  };

  const toggleVisible = async (row: NavSite) => {
    await updateNavSite(row.id, { ...row, visible: !row.visible });
    setData(prev => prev.map(s => s.id === row.id ? { ...s, visible: !s.visible } : s));
  };

  const columns = [
    { title: '', key: 'drag', width: 40, render: () => <DragHandle /> },
    {
      title: '图标', dataIndex: 'icon', key: 'icon', width: 60,
      render: (icon: string) => <span style={{ fontSize: 20 }}>{icon}</span>,
    },
    { title: '站点名称', dataIndex: 'name', key: 'name', render: (n: string) => <strong>{n}</strong> },
    {
      title: '跳转 URL', dataIndex: 'url', key: 'url',
      render: (url: string) => (
        <Tooltip title={url}>
          <span style={{ color: '#1677ff', fontSize: 12 }}>{url.slice(0, 50)}...</span>
        </Tooltip>
      ),
    },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 70 },
    {
      title: '显示', key: 'visible', width: 70,
      render: (_: any, row: NavSite) => <Switch checked={row.visible} size="small" onChange={() => toggleVisible(row)} />,
    },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, row: NavSite) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>导航站点管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增站点</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
          管理顶部搜索栏下方的快捷搜索站点。URL 中的 <code style={{ background: '#f5f5f5', padding: '1px 4px', borderRadius: 3 }}>{'{q}'}</code> 会被替换为用户输入的关键词。
        </p>
        <DraggableTable
          dataSource={data}
          columns={columns}
          loading={loading}
          onSortEnd={handleSortEnd}
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? '编辑站点' : '新增站点'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="站点名称" rules={[{ required: true }]}>
            <Input placeholder="例：百度" maxLength={32} />
          </Form.Item>
          <Form.Item name="icon" label="图标（Emoji）">
            <Input placeholder="🔵" maxLength={8} />
          </Form.Item>
          <Form.Item name="url" label="搜索 URL" rules={[{ required: true }]}
            extra="用 {q} 表示搜索关键词，例：https://www.baidu.com/s?wd={q}">
            <Input placeholder="https://www.baidu.com/s?wd={q}" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序号">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="visible" label="是否显示" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

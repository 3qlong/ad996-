import { useEffect, useState } from 'react';
import {
  Button, Card, Space, Tag, Switch, Modal, Form, Input, InputNumber,
  message, Popconfirm, Typography, Badge, Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { arrayMove } from '@dnd-kit/sortable';
import DraggableTable, { DragHandle } from '../components/DraggableTable';
import {
  getCategories, createCategory, updateCategory, deleteCategory, updateCategorySort,
} from '../api/client';

const { Title } = Typography;

interface Category {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  visible: boolean;
  tool_count: number;
}

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res: any = await getCategories();
    setData(res);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ icon: '📁', sort_order: data.length + 1, visible: true });
    setModalOpen(true);
  };

  const openEdit = (row: Category) => {
    setEditing(row);
    form.setFieldsValue(row);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateCategory(editing.id, values);
      message.success('分类已更新');
    } else {
      await createCategory(values);
      message.success('分类已创建');
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    message.success('已删除');
    load();
  };

  const handleSortEnd = async (newItems: Category[]) => {
    setData(newItems);
    const sortPayload = newItems.map((item, idx) => ({ id: item.id, sort_order: idx + 1 }));
    await updateCategorySort(sortPayload);
    message.success('排序已保存');
  };

  const toggleVisible = async (row: Category) => {
    await updateCategory(row.id, { ...row, visible: !row.visible });
    setData(prev => prev.map(c => c.id === row.id ? { ...c, visible: !c.visible } : c));
  };

  const columns = [
    {
      title: '', key: 'drag', width: 40,
      render: (_: any, __: any, index: number) => {
        const item = data[index];
        return item ? <DragHandleCell id={item.id} data={data} /> : null;
      },
    },
    {
      title: '图标', dataIndex: 'icon', key: 'icon', width: 60,
      render: (icon: string) => <span style={{ fontSize: 22 }}>{icon}</span>,
    },
    { title: '分类名称', dataIndex: 'name', key: 'name', render: (n: string) => <strong>{n}</strong> },
    {
      title: '工具数', dataIndex: 'tool_count', key: 'tool_count', width: 90,
      render: (n: number) => <Badge count={n} style={{ background: '#22c65e' }} showZero />,
    },
    { title: '排序号', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: '显示', dataIndex: 'visible', key: 'visible', width: 80,
      render: (_: any, row: Category) => (
        <Switch checked={row.visible} size="small" onChange={() => toggleVisible(row)} />
      ),
    },
    {
      title: '操作', key: 'actions', width: 120,
      render: (_: any, row: Category) => (
        <Space>
          <Tooltip title="编辑"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} /></Tooltip>
          <Popconfirm
            title={`确认删除「${row.name}」？`}
            description={row.tool_count > 0 ? `该分类下有 ${row.tool_count} 个工具，无法删除` : '此操作不可恢复'}
            onConfirm={() => row.tool_count === 0 ? handleDelete(row.id) : undefined}
            okButtonProps={{ disabled: row.tool_count > 0 }}
          >
            <Tooltip title={row.tool_count > 0 ? '有关联工具，不可删除' : '删除'}>
              <Button size="small" danger icon={<DeleteOutlined />} disabled={row.tool_count > 0} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>分类管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增分类</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
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
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="例：AI写作" maxLength={32} />
          </Form.Item>
          <Form.Item name="icon" label="图标（Emoji）" rules={[{ required: true }]}>
            <Input placeholder="例：✍️" maxLength={8} />
          </Form.Item>
          <Form.Item name="sort_order" label="排序序号">
            <InputNumber min={0} max={9999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="visible" label="是否显示" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// Needs access to data for DragHandle injection
function DragHandleCell({ id, data }: { id: number; data: Category[] }) {
  const item = data.find(d => d.id === id);
  if (!item) return null;
  return <DragHandle />;
}

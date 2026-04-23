import { useEffect, useState } from 'react';
import {
  Button, Card, Space, Switch, Modal, Form, InputNumber, Select,
  message, Popconfirm, Typography, Image,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { arrayMove } from '@dnd-kit/sortable';
import DraggableTable, { DragHandle } from '../components/DraggableTable';
import {
  getRecommendedTools, addRecommendedTool, updateRecommendedTool,
  removeRecommendedTool, updateRecommendedSort, getTools,
} from '../api/client';

const { Title } = Typography;

interface RecommendedTool {
  id: number; tool_id: number | null; sort_order: number; visible: boolean;
  tool_name: string | null; tool_logo: string | null; tool_url: string | null;
}

export default function RecommendedPage() {
  const [data, setData] = useState<RecommendedTool[]>([]);
  const [toolOptions, setToolOptions] = useState<{ label: string; value: number }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res: any = await getRecommendedTools();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Load all tools for the dropdown
    getTools({ page_size: 200 }).then((res: any) => {
      setToolOptions((res.items || []).map((t: any) => ({ label: `${t.emoji} ${t.name}`, value: t.id })));
    });
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await addRecommendedTool({ ...values, sort_order: data.length + 1, visible: true });
    message.success('已添加到推荐');
    setModalOpen(false);
    load();
  };

  const handleSortEnd = async (newItems: RecommendedTool[]) => {
    setData(newItems);
    await updateRecommendedSort(newItems.map((item, i) => ({ id: item.id, sort_order: i + 1 })));
    message.success('排序已保存');
  };

  const toggleVisible = async (row: RecommendedTool) => {
    await updateRecommendedTool(row.id, { tool_id: row.tool_id, sort_order: row.sort_order, visible: !row.visible });
    setData(prev => prev.map(r => r.id === row.id ? { ...r, visible: !r.visible } : r));
  };

  const columns = [
    { title: '', key: 'drag', width: 40, render: () => <DragHandle /> },
    {
      title: '工具', key: 'tool',
      render: (_: any, row: RecommendedTool) => (
        <Space>
          {row.tool_logo && (
            <Image src={row.tool_logo} width={32} height={32} style={{ borderRadius: 6, objectFit: 'contain' }} preview={false} />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{row.tool_name || '（已删除）'}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{row.tool_url?.slice(0, 40)}</div>
          </div>
        </Space>
      ),
    },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 70 },
    {
      title: '显示', key: 'visible', width: 70,
      render: (_: any, row: RecommendedTool) => (
        <Switch checked={row.visible} size="small" onChange={() => toggleVisible(row)} />
      ),
    },
    {
      title: '操作', key: 'actions', width: 80,
      render: (_: any, row: RecommendedTool) => (
        <Popconfirm title="确认从推荐列表移除？" onConfirm={async () => { await removeRecommendedTool(row.id); load(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>推荐工具管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          添加推荐
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
          管理侧边栏底部显示的推荐工具卡片，拖拽调整显示顺序。
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
        title="添加推荐工具"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="添加"
        cancelText="取消"
        width={420}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="tool_id" label="选择工具" rules={[{ required: true, message: '请选择工具' }]}>
            <Select
              showSearch
              options={toolOptions}
              placeholder="搜索工具名称..."
              filterOption={(input, opt) => opt?.label?.toLowerCase().includes(input.toLowerCase()) ?? false}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

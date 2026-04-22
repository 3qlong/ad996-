import { useEffect, useState, useCallback } from 'react';
import {
  Button, Card, Space, Tag, Switch, Modal, Form, Input, InputNumber, Select,
  message, Popconfirm, Typography, Image, Upload, Checkbox, Tooltip, Divider,
  Row, Col, Tabs,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import DraggableTable, { DragHandle } from '../components/DraggableTable';
import {
  getCategories, getTools, createTool, updateTool, deleteTool,
  updateToolSort, batchDeleteTools, batchMoveTools, uploadFile,
} from '../api/client';

const { Title } = Typography;
const { TextArea } = Input;

interface Tool {
  id: number;
  name: string;
  logo: string;
  url: string;
  emoji: string;
  description: string;
  tags: string[];
  category_id: number | null;
  category_name: string | null;
  sort_order: number;
  visible: boolean;
  upvotes: number;
  long_description: string;
  usage_tips: string;
  product_intro: string;
  awards: string;
}

interface Category { id: number; name: string; icon: string; }

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchMoveOpen, setBatchMoveOpen] = useState(false);
  const [batchMoveCat, setBatchMoveCat] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState<number | undefined>();
  const [filterQ, setFilterQ] = useState('');
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    const res: any = await getTools({
      category_id: filterCat,
      q: filterQ || undefined,
      page,
      page_size: 20,
    });
    setTools(res.items);
    setTotal(res.total);
    setLoading(false);
  }, [filterCat, filterQ, page]);

  useEffect(() => {
    getCategories().then((res: any) => setCategories(res));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ visible: true, upvotes: 0, emoji: '🤖', sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: Tool) => {
    setEditing(row);
    form.setFieldsValue({ ...row, tags: row.tags.join(', ') });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const tags = (values.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    const payload = { ...values, tags };
    if (editing) {
      await updateTool(editing.id, payload);
      message.success('工具已更新');
    } else {
      await createTool(payload);
      message.success('工具已创建');
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteTool(id);
    message.success('已删除');
    load();
  };

  const handleSortEnd = async (newItems: Tool[]) => {
    setTools(newItems);
    await updateToolSort(newItems.map((t, i) => ({ id: t.id, sort_order: i + 1 })));
    message.success('排序已保存');
  };

  const handleBatchDelete = async () => {
    await batchDeleteTools(selectedIds);
    message.success(`已删除 ${selectedIds.length} 个工具`);
    setSelectedIds([]);
    load();
  };

  const handleBatchMove = async () => {
    if (!batchMoveCat) return;
    await batchMoveTools(selectedIds, batchMoveCat);
    message.success(`已移动 ${selectedIds.length} 个工具`);
    setBatchMoveOpen(false);
    setSelectedIds([]);
    load();
  };

  const handleLogoUpload = async (file: File) => {
    const url = await uploadFile(file);
    form.setFieldValue('logo', url);
    return false;
  };

  const columns = [
    {
      title: '', key: 'drag', width: 40,
      render: () => <DragHandle />,
    },
    {
      title: '图标', key: 'logo', width: 64,
      render: (_: any, row: Tool) => row.logo
        ? <Image src={row.logo} width={36} height={36} style={{ borderRadius: 6, objectFit: 'contain' }} preview={false} />
        : <span style={{ fontSize: 24 }}>{row.emoji}</span>,
    },
    {
      title: '工具名称', dataIndex: 'name', key: 'name',
      render: (n: string, row: Tool) => (
        <div>
          <div style={{ fontWeight: 600 }}>{n}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{row.description?.slice(0, 30)}...</div>
        </div>
      ),
    },
    {
      title: '分类', dataIndex: 'category_name', key: 'category_name', width: 100,
      render: (n: string) => n ? <Tag color="blue">{n}</Tag> : <Tag>未分类</Tag>,
    },
    {
      title: '标签', dataIndex: 'tags', key: 'tags',
      render: (tags: string[]) => tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>),
    },
    { title: '投票', dataIndex: 'upvotes', key: 'upvotes', width: 70, sorter: (a: Tool, b: Tool) => b.upvotes - a.upvotes },
    {
      title: '显示', dataIndex: 'visible', key: 'visible', width: 70,
      render: (_: any, row: Tool) => (
        <Switch checked={row.visible} size="small"
          onChange={async () => { await updateTool(row.id, { ...row, visible: !row.visible }); load(); }}
        />
      ),
    },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, row: Tool) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const catOptions = categories.map(c => ({ label: `${c.icon} ${c.name}`, value: c.id }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>工具管理 <span style={{ fontSize: 14, color: '#999', fontWeight: 400 }}>共 {total} 个</span></Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增工具</Button>
      </div>

      {/* Filters */}
      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="按分类筛选"
            allowClear
            style={{ width: 160 }}
            options={[{ label: '全部分类', value: undefined }, ...catOptions]}
            onChange={v => { setFilterCat(v); setPage(1); }}
          />
          <Input.Search
            placeholder="搜索工具名称..."
            style={{ width: 200 }}
            allowClear
            onSearch={v => { setFilterQ(v); setPage(1); }}
          />
        </Space>
      </Card>

      {/* Batch Operations */}
      {selectedIds.length > 0 && (
        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 12, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space>
            <span style={{ color: '#52c41a' }}>已选 {selectedIds.length} 个工具</span>
            <Popconfirm title={`确认批量删除 ${selectedIds.length} 个工具？`} onConfirm={handleBatchDelete}>
              <Button danger size="small">批量删除</Button>
            </Popconfirm>
            <Button size="small" onClick={() => setBatchMoveOpen(true)}>批量移动分类</Button>
            <Button size="small" onClick={() => setSelectedIds([])}>取消选择</Button>
          </Space>
        </Card>
      )}

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <DraggableTable
          dataSource={tools}
          columns={columns}
          loading={loading}
          onSortEnd={handleSortEnd}
          rowSelection={{
            selectedRowKeys: selectedIds,
            onChange: keys => setSelectedIds(keys as number[]),
          }}
          pagination={{ current: page, pageSize: 20, total, onChange: setPage, showSizeChanger: false }}
          size="middle"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? `编辑工具：${editing.name}` : '新增工具'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={720}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs items={[
            {
              key: 'basic',
              label: '基本信息',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="name" label="工具名称" rules={[{ required: true }]}>
                      <Input placeholder="例：ChatGPT" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="emoji" label="Emoji 图标">
                      <Input placeholder="🤖" maxLength={4} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="logo" label="Logo URL">
                      <Input
                        placeholder="https://example.com/logo.png"
                        addonAfter={
                          <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
                            <Tooltip title="上传图片"><UploadOutlined style={{ cursor: 'pointer' }} /></Tooltip>
                          </Upload>
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="url" label="跳转链接" rules={[{ required: true }]}>
                      <Input placeholder="https://..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="category_id" label="所属分类">
                      <Select options={catOptions} placeholder="选择分类" allowClear />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="tags" label="标签（逗号分隔）">
                      <Input placeholder="AI写作工具, 效率工具" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="description" label="简介">
                      <TextArea rows={2} placeholder="简短描述..." maxLength={200} showCount />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="sort_order" label="排序号">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="upvotes" label="投票数">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="visible" label="是否显示" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'detail',
              label: '详情内容',
              children: (
                <>
                  <Form.Item name="long_description" label="详细描述">
                    <TextArea rows={4} />
                  </Form.Item>
                  <Form.Item name="usage_tips" label="使用技巧">
                    <TextArea rows={3} />
                  </Form.Item>
                  <Form.Item name="product_intro" label="产品介绍">
                    <TextArea rows={3} />
                  </Form.Item>
                  <Form.Item name="awards" label="获奖/荣誉">
                    <TextArea rows={2} />
                  </Form.Item>
                </>
              ),
            },
          ]} />
        </Form>
      </Modal>

      {/* Batch Move Modal */}
      <Modal
        title="批量移动分类"
        open={batchMoveOpen}
        onOk={handleBatchMove}
        onCancel={() => setBatchMoveOpen(false)}
        okText="确认移动"
      >
        <p style={{ marginBottom: 16 }}>将 {selectedIds.length} 个工具移动到：</p>
        <Select
          options={catOptions}
          placeholder="选择目标分类"
          style={{ width: '100%' }}
          onChange={v => setBatchMoveCat(v)}
        />
      </Modal>
    </div>
  );
}

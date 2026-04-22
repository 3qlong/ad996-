import { useEffect, useState } from 'react';
import {
  Button, Card, Space, Tag, Modal, Form, Input, Select, ColorPicker,
  message, Popconfirm, Typography, Table, DatePicker, Row, Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../api/client';

const { Title } = Typography;

interface CalendarEvent {
  id: number; title: string; date: string; description: string;
  event_type: string; color: string; created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  holiday: '节日假期', marketing: '营销节点', custom: '自定义',
};
const TYPE_COLORS: Record<string, string> = {
  holiday: 'red', marketing: 'orange', custom: 'blue',
};

export default function CalendarPage() {
  const [data, setData] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterType, setFilterType] = useState<string | undefined>();
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res: any = await getCalendarEvents({ year: filterYear, event_type: filterType });
    setData(res);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterYear, filterType]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ event_type: 'holiday', color: '#f5222d' });
    setModalOpen(true);
  };

  const openEdit = (row: CalendarEvent) => {
    setEditing(row);
    form.setFieldsValue({ ...row, date: dayjs(row.date) });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : values.date,
      color: typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#22c65e',
    };
    if (editing) {
      await updateCalendarEvent(editing.id, payload);
      message.success('事件已更新');
    } else {
      await createCalendarEvent(payload);
      message.success('事件已添加');
    }
    setModalOpen(false);
    load();
  };

  const columns = [
    {
      title: '标题', dataIndex: 'title', key: 'title',
      render: (t: string, row: CalendarEvent) => (
        <Space>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: row.color, display: 'inline-block' }} />
          <strong>{t}</strong>
        </Space>
      ),
    },
    { title: '日期', dataIndex: 'date', key: 'date', width: 110, sorter: (a: CalendarEvent, b: CalendarEvent) => a.date.localeCompare(b.date) },
    {
      title: '类型', dataIndex: 'event_type', key: 'event_type', width: 100,
      render: (t: string) => <Tag color={TYPE_COLORS[t] || 'default'}>{TYPE_LABELS[t] || t}</Tag>,
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, row: CalendarEvent) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          <Popconfirm title="确认删除？" onConfirm={async () => { await deleteCalendarEvent(row.id); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const yearOptions = [2024, 2025, 2026, 2027].map(y => ({ label: `${y}年`, value: y }));
  const typeOptions = [
    { label: '全部类型', value: undefined },
    { label: '节日假期', value: 'holiday' },
    { label: '营销节点', value: 'marketing' },
    { label: '自定义', value: 'custom' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>营销日历管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加事件</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Select options={yearOptions} value={filterYear} onChange={setFilterYear} style={{ width: 100 }} />
          <Select options={typeOptions} value={filterType} onChange={setFilterType} style={{ width: 130 }} placeholder="全部类型" allowClear />
        </Space>
      </Card>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 30, showSizeChanger: false }}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? '编辑日历事件' : '添加日历事件'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="事件标题" rules={[{ required: true }]}>
            <Input placeholder="例：双十一大促" />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="event_type" label="事件类型">
            <Select options={[
              { label: '节日假期', value: 'holiday' },
              { label: '营销节点', value: 'marketing' },
              { label: '自定义', value: 'custom' },
            ]} />
          </Form.Item>
          <Form.Item name="color" label="颜色标记">
            <ColorPicker showText />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="事件描述..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

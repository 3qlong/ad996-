import { useEffect, useState } from 'react';
import {
  Card, Space, Tag, Modal, message, Popconfirm, Typography, Table, Select, Button,
} from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getBusinessInquiries, updateInquiryStatus, deleteInquiry } from '../api/client';

const { Title, Text } = Typography;

interface Inquiry {
  id: number; company: string; contact_name: string; email: string;
  phone: string; coop_type: string; message: string; status: string; created_at: string;
}

const STATUS_COLORS: Record<string, string> = { pending: 'orange', processing: 'blue', done: 'green' };
const STATUS_LABELS: Record<string, string> = { pending: '待处理', processing: '处理中', done: '已完成' };
const TYPE_COLORS: Record<string, string> = { '广告合作': 'purple', '内容合作': 'cyan', 'API合作': 'geekblue', '其他': 'default' };

export default function BusinessPage() {
  const [data, setData] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [detail, setDetail] = useState<Inquiry | null>(null);

  const load = async () => {
    setLoading(true);
    const res: any = await getBusinessInquiries({ status: statusFilter, page, page_size: 20 });
    setData(res.items);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, page]);

  const handleStatusChange = async (id: number, status: string) => {
    await updateInquiryStatus(id, status);
    message.success('状态已更新');
    load();
  };

  const columns = [
    {
      title: '公司/联系人', key: 'contact',
      render: (_: any, row: Inquiry) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.company || row.contact_name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{row.email}</div>
        </div>
      ),
    },
    {
      title: '合作类型', dataIndex: 'coop_type', key: 'coop_type', width: 100,
      render: (t: string) => <Tag color={TYPE_COLORS[t] || 'default'}>{t}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string, row: Inquiry) => (
        <Select
          value={s}
          size="small"
          style={{ width: 90 }}
          onChange={v => handleStatusChange(row.id, v)}
          options={[
            { label: '待处理', value: 'pending' },
            { label: '处理中', value: 'processing' },
            { label: '已完成', value: 'done' },
          ]}
        />
      ),
    },
    { title: '提交时间', dataIndex: 'created_at', key: 'created_at', width: 100, render: (t: string) => t.slice(0, 10) },
    {
      title: '操作', key: 'actions', width: 100,
      render: (_: any, row: Inquiry) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(row)}>详情</Button>
          <Popconfirm title="确认删除？" onConfirm={async () => { await deleteInquiry(row.id); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const statsCards = [
    { label: '待处理', color: '#fa8c16', filter: 'pending' },
    { label: '处理中', color: '#1890ff', filter: 'processing' },
    { label: '已完成', color: '#52c41a', filter: 'done' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>商务合作管理</Title>

      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '全部', value: undefined },
              { label: '待处理', value: 'pending' },
              { label: '处理中', value: 'processing' },
              { label: '已完成', value: 'done' },
            ]}
            onChange={v => { setStatusFilter(v); setPage(1); }}
          />
        </Space>
      </Card>

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
        title="合作详情"
        open={!!detail}
        footer={null}
        onCancel={() => setDetail(null)}
        width={560}
      >
        {detail && (
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {[
              ['公司', detail.company], ['联系人', detail.contact_name],
              ['邮箱', detail.email], ['电话', detail.phone || '-'],
              ['合作类型', <Tag color={TYPE_COLORS[detail.coop_type]}>{detail.coop_type}</Tag>],
              ['状态', <Tag color={STATUS_COLORS[detail.status]}>{STATUS_LABELS[detail.status]}</Tag>],
              ['提交时间', detail.created_at?.slice(0, 19)],
            ].map(([label, value]) => (
              <div key={String(label)} style={{ display: 'flex', gap: 8 }}>
                <Text type="secondary" style={{ minWidth: 70, textAlign: 'right' }}>{label}：</Text>
                <span>{value}</span>
              </div>
            ))}
            <div>
              <Text type="secondary">合作内容：</Text>
              <p style={{ marginTop: 4, color: '#333', background: '#f9f9f9', padding: 12, borderRadius: 8 }}>{detail.message || '（无）'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

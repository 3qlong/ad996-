import { useEffect, useState } from 'react';
import {
  Button, Card, Space, Tag, Modal, Form, Input, message,
  Popconfirm, Typography, Select, Tabs,
} from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { getSubmissions, reviewSubmission, deleteSubmission } from '../api/client';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Submission {
  id: number; name: string; url: string; description: string;
  category: string; contact_email: string; status: string;
  review_note: string; created_at: string; reviewed_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'orange', approved: 'green', rejected: 'red',
};
const STATUS_LABELS: Record<string, string> = {
  pending: '待审核', approved: '已通过', rejected: '已驳回',
};

export default function SubmissionsPage() {
  const [data, setData] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [detail, setDetail] = useState<Submission | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const res: any = await getSubmissions({ status: statusFilter, page, page_size: 20 });
    setData(res.items);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, page]);

  const handleReview = async (status: string) => {
    if (!reviewing) return;
    const values = await form.validateFields();
    await reviewSubmission(reviewing.id, { status, review_note: values.review_note });
    message.success(status === 'approved' ? '已通过' : '已驳回');
    setReviewing(null);
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteSubmission(id);
    message.success('已删除');
    load();
  };

  const columns = [
    { title: '站点名称', dataIndex: 'name', key: 'name', render: (n: string) => <strong>{n}</strong> },
    {
      title: 'URL', dataIndex: 'url', key: 'url',
      render: (url: string) => <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>{url.slice(0, 40)}...</a>,
    },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
    { title: '联系邮箱', dataIndex: 'contact_email', key: 'contact_email', width: 160 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <Tag color={STATUS_COLORS[s]}>{STATUS_LABELS[s]}</Tag>,
    },
    { title: '提交时间', dataIndex: 'created_at', key: 'created_at', width: 100, render: (t: string) => t.slice(0, 10) },
    {
      title: '操作', key: 'actions', width: 140,
      render: (_: any, row: Submission) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(row)}>详情</Button>
          {row.status === 'pending' && (
            <>
              <Button size="small" type="primary" icon={<CheckOutlined />}
                onClick={() => { setReviewing(row); form.resetFields(); }}>审核</Button>
            </>
          )}
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: '', label: `全部 (${total})` },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已驳回' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>网站收录管理</Title>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Tabs
          items={tabItems}
          onChange={key => { setStatusFilter(key || undefined); setPage(1); }}
        />
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize: 20, total, onChange: setPage }}
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="收录申请详情"
        open={!!detail}
        footer={null}
        onCancel={() => setDetail(null)}
        width={560}
      >
        {detail && (
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {[
              ['站点名称', detail.name], ['URL', detail.url],
              ['所属分类', detail.category], ['联系邮箱', detail.contact_email],
              ['状态', <Tag color={STATUS_COLORS[detail.status]}>{STATUS_LABELS[detail.status]}</Tag>],
              ['提交时间', detail.created_at?.slice(0, 19)],
              ['审核时间', detail.reviewed_at?.slice(0, 19) || '-'],
              ['审核备注', detail.review_note || '-'],
            ].map(([label, value]) => (
              <div key={String(label)} style={{ display: 'flex', gap: 8 }}>
                <Text type="secondary" style={{ minWidth: 80, textAlign: 'right' }}>{label}：</Text>
                <span>{value}</span>
              </div>
            ))}
            {detail.description && (
              <div>
                <Text type="secondary">描述：</Text>
                <p style={{ marginTop: 4, color: '#333' }}>{detail.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title={`审核申请：${reviewing?.name}`}
        open={!!reviewing}
        onCancel={() => setReviewing(null)}
        footer={
          <Space>
            <Button onClick={() => setReviewing(null)}>取消</Button>
            <Button danger icon={<CloseOutlined />} onClick={() => handleReview('rejected')}>驳回</Button>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => handleReview('approved')}>通过</Button>
          </Space>
        }
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="review_note" label="审核备注（可选）">
            <TextArea rows={3} placeholder="填写驳回原因或通过说明..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

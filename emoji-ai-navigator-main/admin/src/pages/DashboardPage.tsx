import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import {
  ToolOutlined, AppstoreOutlined, InboxOutlined, TeamOutlined,
  RiseOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { getDashboard } from '../api/client';

const { Title } = Typography;

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then((d: any) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const stats = [
    { title: '工具总数', value: data.total_tools, icon: <ToolOutlined />, color: '#22c65e' },
    { title: '分类数', value: data.total_categories, icon: <AppstoreOutlined />, color: '#1890ff' },
    { title: '用户数', value: data.total_users, icon: <TeamOutlined />, color: '#722ed1' },
    { title: '待审核收录', value: data.pending_submissions, icon: <InboxOutlined />, color: '#fa8c16' },
    { title: '待处理合作', value: data.pending_inquiries, icon: <RiseOutlined />, color: '#eb2f96' },
    { title: '日历事件', value: data.total_calendar_events, icon: <CalendarOutlined />, color: '#13c2c2' },
  ];

  const submissionColumns = [
    { title: '站点名称', dataIndex: 'name', key: 'name' },
    { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => (
        <Tag color={s === 'pending' ? 'orange' : s === 'approved' ? 'green' : 'red'}>
          {s === 'pending' ? '待审核' : s === 'approved' ? '已通过' : '已驳回'}
        </Tag>
      ),
    },
    { title: '提交时间', dataIndex: 'created_at', key: 'created_at', render: (t: string) => t.slice(0, 10) },
  ];

  const toolColumns = [
    {
      title: '工具', dataIndex: 'name', key: 'name',
      render: (name: string, row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {row.logo && <img src={row.logo} alt="" style={{ width: 24, height: 24, borderRadius: 4 }} />}
          <span>{name}</span>
        </div>
      ),
    },
    { title: '投票数', dataIndex: 'upvotes', key: 'upvotes', sorter: (a: any, b: any) => b.upvotes - a.upvotes },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>数据概览</Title>

      <Row gutter={[16, 16]}>
        {stats.map(s => (
          <Col key={s.title} xs={24} sm={12} lg={8} xl={4}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title={s.title}
                value={s.value}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                valueStyle={{ color: s.color, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="最新收录申请" bordered={false} style={{ borderRadius: 12 }}>
            <Table
              columns={submissionColumns}
              dataSource={data.recent_submissions}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="热门工具 Top 5" bordered={false} style={{ borderRadius: 12 }}>
            <Table
              columns={toolColumns}
              dataSource={data.top_tools}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

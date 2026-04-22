import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Typography, Avatar, Space } from 'antd';
import {
  DashboardOutlined, AppstoreOutlined, ToolOutlined, LinkOutlined,
  CalendarOutlined, InboxOutlined, TeamOutlined, StarOutlined,
  MessageOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard',   icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/categories',  icon: <AppstoreOutlined />,  label: '分类管理' },
  { key: '/tools',       icon: <ToolOutlined />,       label: '工具管理' },
  { key: '/nav-sites',   icon: <LinkOutlined />,       label: '导航站点' },
  { key: '/recommended', icon: <StarOutlined />,       label: '推荐工具' },
  { key: '/calendar',    icon: <CalendarOutlined />,   label: '营销日历' },
  { key: '/submissions', icon: <InboxOutlined />,      label: '网站收录' },
  { key: '/business',    icon: <MessageOutlined />,    label: '商务合作' },
  { key: '/users',       icon: <TeamOutlined />,       label: '用户管理' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={220}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          gap: 10,
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #22c65e 0%, #16a34a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>⚙️</div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>AI导航管理</span>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 56,
        }}>
          <Space>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#666' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {menuItems.find(m => m.key === location.pathname)?.label || '管理后台'}
            </Text>
          </Space>
          <Space>
            <Badge dot>
              <Avatar size={32} style={{ background: '#22c65e', cursor: 'pointer' }}>A</Avatar>
            </Badge>
            <Text strong style={{ fontSize: 13 }}>admin</Text>
          </Space>
        </Header>

        <Content style={{ margin: 24, minHeight: 'calc(100vh - 56px - 48px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

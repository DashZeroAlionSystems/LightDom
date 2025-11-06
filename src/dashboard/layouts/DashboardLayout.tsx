/**
 * Dashboard Layout
 * Main layout wrapper with sidebar navigation
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  SearchOutlined,
  BulbOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={250}>
        <div style={{ padding: '16px', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          LightDom SEO
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Overview' },
            { key: 'analytics', icon: <LineChartOutlined />, label: 'Analytics' },
            { key: 'keywords', icon: <SearchOutlined />, label: 'Keywords' },
            { key: 'recommendations', icon: <BulbOutlined />, label: 'Recommendations' },
            { key: 'reports', icon: <FileTextOutlined />, label: 'Reports' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#141833', padding: '0 24px', color: '#fff' }}>
          LightDom SEO Dashboard
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#0A0E27' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

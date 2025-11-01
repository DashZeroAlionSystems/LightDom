/**
 * Main Dashboard - Switchable between Admin and User views
 * Renders Admin dashboard first with easy switching capability
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Space,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Switch,
  Alert,
  message,
  Modal,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CrownOutlined,
  SwapOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';

import ProfessionalAdminDashboard from './admin/ProfessionalAdminDashboard';
import AdvancedDashboardIntegrated from './AdvancedDashboardIntegrated';
import {
  EnhancedButton,
  EnhancedAvatar,
} from './DesignSystemComponents';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface MainDashboardProps {
  defaultMode?: 'admin' | 'user';
}

const MainDashboard: React.FC<MainDashboardProps> = ({ defaultMode = 'admin' }) => {
  const [currentMode, setCurrentMode] = useState<'admin' | 'user'>(defaultMode);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('admin');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(5);

  useEffect(() => {
    // Check user role from localStorage or context
    const savedRole = localStorage.getItem('userRole') as 'admin' | 'user' || 'admin';
    setUserRole(savedRole);
    setCurrentMode(savedRole);
  }, []);

  const handleModeSwitch = (mode: 'admin' | 'user') => {
    if (mode === 'admin' && userRole !== 'admin') {
      message.error('You do not have admin privileges');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setCurrentMode(mode);
      setUserRole(mode);
      localStorage.setItem('userRole', mode);
      setLoading(false);
      message.success(`Switched to ${mode} dashboard`);
    }, 500);
  };

  const handleQuickSwitch = () => {
    const newMode = currentMode === 'admin' ? 'user' : 'admin';
    handleModeSwitch(newMode);
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      onOk() {
        localStorage.removeItem('userRole');
        message.success('Logged out successfully');
        // Redirect to login page or handle logout logic
      },
    });
  };

  const renderDashboardHeader = () => (
    <Header style={{
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Left Side - Dashboard Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <Space size="large">
          {/* Dashboard Switch Button */}
          <EnhancedButton
            variant={currentMode === 'admin' ? 'primary' : 'ghost'}
            icon={<CrownOutlined />}
            onClick={() => handleModeSwitch('admin')}
            loading={loading}
            style={{
              borderRadius: '8px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Admin Dashboard
          </EnhancedButton>
          
          <EnhancedButton
            variant={currentMode === 'user' ? 'primary' : 'ghost'}
            icon={<UserOutlined />}
            onClick={() => handleModeSwitch('user')}
            loading={loading}
            style={{
              borderRadius: '8px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            User Dashboard
          </EnhancedButton>

          {/* Quick Switch Toggle */}
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '1px solid #e8e8e8',
          }}>
            <Space>
              <Text type="secondary">Quick Switch:</Text>
              <Switch
                checked={currentMode === 'admin'}
                onChange={handleQuickSwitch}
                checkedChildren={<CrownOutlined />}
                unCheckedChildren={<UserOutlined />}
                style={{ backgroundColor: currentMode === 'admin' ? '#1890ff' : '#52c41a' }}
              />
            </Space>
          </div>
        </Space>
      </div>

      {/* Center - Dashboard Title */}
      <div style={{ textAlign: 'center' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          {currentMode === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
        </Title>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {currentMode === 'admin' ? 'Full system administration' : 'Personal workspace'}
        </Text>
      </div>

      {/* Right Side - User Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <Space size="middle">
          {/* Notifications */}
          <Tooltip title="Notifications">
            <Badge count={notifications} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ 
                  fontSize: '16px',
                  height: '40px',
                  width: '40px',
                  borderRadius: '50%',
                }}
                onClick={() => message.info('Notifications panel coming soon')}
              />
            </Badge>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              style={{ 
                fontSize: '16px',
                height: '40px',
                width: '40px',
                borderRadius: '50%',
              }}
              onClick={() => message.info('Settings panel coming soon')}
            />
          </Tooltip>

          {/* User Avatar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
            <EnhancedAvatar 
              text={currentMode === 'admin' ? 'AD' : 'USR'} 
              size="medium"
              style={{
                backgroundColor: currentMode === 'admin' ? '#1890ff' : '#52c41a',
              }}
            />
            <div style={{ marginLeft: '8px' }}>
              <Text strong style={{ display: 'block', lineHeight: '1.2' }}>
                {currentMode === 'admin' ? 'Admin User' : 'Regular User'}
              </Text>
              <Text type="secondary" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                {currentMode === 'admin' ? 'Administrator' : 'Standard User'}
              </Text>
            </div>
          </div>

          {/* Logout */}
          <Tooltip title="Logout">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              style={{ 
                fontSize: '16px',
                height: '40px',
                width: '40px',
                borderRadius: '50%',
                color: '#ff4d4f',
              }}
              onClick={handleLogout}
            />
          </Tooltip>
        </Space>
      </div>
    </Header>
  );

  const renderDashboardContent = () => {
    if (currentMode === 'admin') {
      return <ProfessionalAdminDashboard />;
    }
    return <AdvancedDashboardIntegrated />;
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Dashboard Header with Switcher */}
      {renderDashboardHeader()}

      {/* Dashboard Content */}
      <Content style={{ padding: 0 }}>
        {/* Mode Indicator Alert */}
        <div style={{ 
          padding: '12px', 
          backgroundColor: currentMode === 'admin' ? '#e6f7ff' : '#f6ffed',
          borderBottom: `1px solid ${currentMode === 'admin' ? '#91d5ff' : '#b7eb8f'}`,
        }}>
          <Alert
            message={
              <Space>
                {currentMode === 'admin' ? <CrownOutlined /> : <UserOutlined />}
                <Text strong>
                  {currentMode === 'admin' ? 'Admin Mode Active' : 'User Mode Active'}
                </Text>
              </Space>
            }
            description={
              currentMode === 'admin' 
                ? 'You have full administrative privileges. Access to all system settings and user management.'
                : 'You are in user mode. Access to personal workspace and limited features.'
            }
            type={currentMode === 'admin' ? 'info' : 'success'}
            showIcon={false}
            closable
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
            }}
          />
        </div>

        {/* Main Dashboard Content */}
        <div style={{ 
          height: 'calc(100vh - 120px)',
          overflow: 'auto',
        }}>
          {renderDashboardContent()}
        </div>
      </Content>
    </Layout>
  );
};

export default MainDashboard;

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, message, Typography, Divider } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { history, useModel, useAccess, useIntl } from '@umijs/max';
import UserDirectory from '@/components/UserDirectory';
import { getAllUsers } from '@/services/ant-design-pro/api';

const { Title, Text } = Typography;

const Admin: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const access = useAccess();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!currentUser || !access.canAdmin) return;

    setLoadingStats(true);
    try {
      // Fetch total users (first page with limit 1 just to get the total count)
      const allUsersResponse = await getAllUsers({ page: 1, limit: 1 });
      setTotalUsers(allUsersResponse.total);

      // Fetch active users (exclude deleted, first page with limit 1 just to get the total count)
      const activeUsersResponse = await getAllUsers({ page: 1, limit: 1, include_deleted: false });
      setActiveUsers(activeUsersResponse.total);

      // Fetch admin users (first page with limit 1 just to get the total count)
      const adminUsersResponse = await getAllUsers({ page: 1, limit: 1, role: 'admin' });
      setAdminCount(adminUsersResponse.total);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error(intl.formatMessage({ id: 'pages.admin.statsError' }));
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in and has admin access
    if (!currentUser) {
      message.error(intl.formatMessage({ id: 'pages.admin.loginRequired' }));
      history.push('/user/login');
      return;
    }

    if (!access.canAdmin) {
      message.error(intl.formatMessage({ id: 'pages.admin.permissionDenied' }));
      history.push('/welcome');
      return;
    }

    // Fetch statistics when component mounts and user has access
    fetchStatistics();
  }, [currentUser, access.canAdmin]);

  // Show loading state if not yet verified
  if (!currentUser) {
    return null;
  }

  if (!access.canAdmin) {
    return null;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2}>{intl.formatMessage({ id: 'pages.admin.title' })}</Title>
      <Text type="secondary">
        {intl.formatMessage({ id: 'pages.admin.welcome' }, { name: currentUser.name })}
      </Text>

      <Divider />

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loadingStats}>
            <Statistic
              title={intl.formatMessage({ id: 'pages.admin.totalUsers' })}
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loadingStats}>
            <Statistic
              title={intl.formatMessage({ id: 'pages.admin.activeUsers' })}
              value={activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loadingStats}>
            <Statistic
              title={intl.formatMessage({ id: 'pages.admin.admins' })}
              value={adminCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={intl.formatMessage({ id: 'pages.admin.revenue' })}
              value={12345}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
              suffix={
                <Tag color="red" icon={<ArrowDownOutlined />}>
                  5%
                </Tag>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* User Directory */}
      <UserDirectory />
    </div>
  );
};

export default Admin;

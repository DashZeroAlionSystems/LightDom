import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const OverviewPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: 24 }}>Dashboard Overview</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SEO Score"
              value={85}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="/ 100"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Organic Traffic"
              value={12543}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Keywords Ranking"
              value={234}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Core Web Vitals"
              value={92}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              suffix="% Pass"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewPage;

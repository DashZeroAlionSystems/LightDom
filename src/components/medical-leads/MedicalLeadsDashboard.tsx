import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, DatePicker, Select, Space, Progress, Modal } from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  LineChartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Lead {
  id: number;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  region: string;
  lead_score: number;
  qualification_status: string;
  data_completeness: number;
  created_at: string;
}

interface DashboardMetrics {
  leads_generated: number;
  leads_qualified: number;
  leads_contacted: number;
  leads_converted: number;
  avg_lead_score: number;
  qualification_rate: number;
  conversion_rate: number;
}

export const MedicalLeadsDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, statusFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch metrics
      const metricsResponse = await fetch(
        `/api/medical-leads/metrics?campaign_id=sa-medical-insurance-leads-24-7${
          dateRange ? `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}` : ''
        }`
      );
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch leads
      const leadsResponse = await fetch(
        `/api/medical-leads/list?${statusFilter !== 'all' ? `status=${statusFilter}` : ''}${
          dateRange ? `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}` : ''
        }`
      );
      const leadsData = await leadsResponse.json();
      setLeads(leadsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch('/api/medical-leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          filters: {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            start_date: dateRange?.[0].format('YYYY-MM-DD'),
            end_date: dateRange?.[1].format('YYYY-MM-DD'),
          },
        }),
      });

      const data = await response.json();
      if (data.file_path) {
        // Download file
        window.open(`/api/medical-leads/download/${data.export_id}`, '_blank');
        setExportModalVisible(false);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      qualified: 'success',
      pending: 'warning',
      contacted: 'processing',
      converted: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<Lead> = [
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      sorter: (a, b) => a.company_name.localeCompare(b.company_name),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.contact_email}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.contact_phone}</div>
        </div>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      filters: [
        { text: 'Gauteng', value: 'Gauteng' },
        { text: 'Western Cape', value: 'Western Cape' },
        { text: 'KwaZulu-Natal', value: 'KwaZulu-Natal' },
      ],
      onFilter: (value, record) => record.region === value,
    },
    {
      title: 'Lead Score',
      dataIndex: 'lead_score',
      key: 'lead_score',
      sorter: (a, b) => a.lead_score - b.lead_score,
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          status={score >= 80 ? 'success' : score >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: 'Completeness',
      dataIndex: 'data_completeness',
      key: 'data_completeness',
      render: (completeness: number) => `${completeness}%`,
    },
    {
      title: 'Status',
      dataIndex: 'qualification_status',
      key: 'qualification_status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Medical Insurance Leads Dashboard</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDashboardData}>
            Refresh
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => setExportModalVisible(true)}>
            Export
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="large">
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            format="YYYY-MM-DD"
          />
          <Select
            style={{ width: 200 }}
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="qualified">Qualified</Option>
            <Option value="contacted">Contacted</Option>
            <Option value="converted">Converted</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Space>
      </Card>

      {/* Metrics */}
      {metrics && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Leads Generated"
                value={metrics.leads_generated}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Qualified Leads"
                value={metrics.leads_qualified}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Qualification Rate"
                value={metrics.qualification_rate}
                suffix="%"
                precision={1}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Conversion Rate"
                value={metrics.conversion_rate}
                suffix="%"
                precision={1}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Leads Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={leads}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leads`,
          }}
        />
      </Card>

      {/* Export Modal */}
      <Modal
        title="Export Leads"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setExportModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="csv" onClick={() => handleExport('csv')}>
            Export as CSV
          </Button>,
          <Button key="excel" type="primary" onClick={() => handleExport('excel')}>
            Export as Excel
          </Button>,
        ]}
      >
        <p>Export {leads.length} leads matching current filters?</p>
        <p>Format: CSV or Excel with color-coded lead scores</p>
      </Modal>
    </div>
  );
};

export default MedicalLeadsDashboard;

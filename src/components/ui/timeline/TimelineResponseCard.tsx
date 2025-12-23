import React from 'react';
import { Card, Space, Tag, Typography, Button, Progress, List } from 'antd';
import { LikeOutlined, DislikeOutlined, PaperClipOutlined } from '@ant-design/icons';
import { TimelineResponseCard as TimelineResponseCardType, TrainingSignal } from '@/modules/timelines/types';

const { Text, Paragraph } = Typography;

interface TimelineResponseCardProps {
  response: TimelineResponseCardType;
  onTrain: (signal: TrainingSignal) => void;
  footer?: React.ReactNode;
}

const TimelineResponseCard: React.FC<TimelineResponseCardProps> = ({ response, onTrain, footer }) => {
  const totalVotes = response.training.positive + response.training.negative;
  const approvalPercent = Math.min(
    100,
    totalVotes === 0 ? 0 : (response.training.positive / totalVotes) * 100,
  );
  const progressFormat = () => `${response.training.positive}/${totalVotes}`;

  return (
    <Card size="small" hoverable>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Text strong>{response.prompt}</Text>
          <Space>
            {response.channel && <Tag color={response.channel === 'chat' ? 'blue' : 'purple'}>{response.channel}</Tag>}
            {typeof response.qualityScore === 'number' && (
              <Tag color={response.qualityScore > 85 ? 'green' : response.qualityScore > 70 ? 'gold' : 'red'}>
                Q{response.qualityScore}
              </Tag>
            )}
          </Space>
        </Space>

        <Paragraph style={{ marginBottom: 0 }}>{response.response}</Paragraph>

        {response.attachments && response.attachments.length > 0 && (
          <List
            size="small"
            header={
              <Space>
                <PaperClipOutlined />
                <Text type="secondary">Attachments</Text>
              </Space>
            }
            dataSource={response.attachments}
            renderItem={item => (
              <List.Item>
                <Space>
                  <Tag color="geekblue">{item.type}</Tag>
                  <Text strong>{item.name}</Text>
                  {item.description && <Text type="secondary">{item.description}</Text>}
                </Space>
              </List.Item>
            )}
          />
        )}

        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Button
              size="small"
              icon={<LikeOutlined />}
              type="primary"
              onClick={() => onTrain('positive')}
            >
              Approve
            </Button>
            <Button
              size="small"
              icon={<DislikeOutlined />}
              danger
              onClick={() => onTrain('negative')}
            >
              Retrain
            </Button>
          </Space>
          <Space>
            <Progress
              size="small"
              type="circle"
              percent={approvalPercent}
              width={44}
              format={progressFormat}
            />
            {response.training.lastSignal && <Tag>{response.training.lastSignal}</Tag>}
          </Space>
        </Space>
        {footer}
      </Space>
    </Card>
  );
};

export default TimelineResponseCard;

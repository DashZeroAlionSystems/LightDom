/**
 * DeepSeek Skills Management Dashboard
 * Allows DeepSeek to view, learn, and acquire new skills
 * Includes visualization skills: info charts, maps, and 3D rendering
 * Created: 2025-11-06
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  List,
  Tag,
  Progress,
  Steps,
  Descriptions,
  Tabs,
  Badge,
  Space,
  message,
  Modal,
  Timeline
} from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  BookOutlined,
  CodeOutlined,
  LineChartOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import DeepSeekSkillAcquisitionService from '../../services/DeepSeekSkillAcquisitionService';
import type { Skill, SkillAcquisitionProgress } from '../../services/DeepSeekSkillAcquisitionService';

const { TabPane } = Tabs;
const { Step } = Steps;

const DeepSeekSkillsDashboard: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkills, setCurrentSkills] = useState<string[]>(['data-processing', 'api-integration']);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [learningProgress, setLearningProgress] = useState<SkillAcquisitionProgress | null>(null);
  const [showLearningModal, setShowLearningModal] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = () => {
    const visualizationSkills = DeepSeekSkillAcquisitionService.getVisualizationSkills();
    setSkills(visualizationSkills);
  };

  const startLearning = async (skill: Skill) => {
    try {
      const progress = await DeepSeekSkillAcquisitionService.startLearning(skill.id);
      setSelectedSkill(skill);
      setLearningProgress(progress);
      setShowLearningModal(true);
      message.success(`Started learning ${skill.name}`);
    } catch (error: any) {
      message.error(`Failed to start learning: ${error.message}`);
    }
  };

  const completeSkill = (skillId: string) => {
    setCurrentSkills([...currentSkills, skillId]);
    setShowLearningModal(false);
    setLearningProgress(null);
    message.success('Skill acquired successfully!');
  };

  const getSkillIcon = (category: string) => {
    switch (category) {
      case 'visualization':
        return <LineChartOutlined />;
      case 'data-processing':
        return <CodeOutlined />;
      case 'ai-ml':
        return <ThunderboltOutlined />;
      default:
        return <RocketOutlined />;
    }
  };

  const renderSkillCard = (skill: Skill) => {
    const isAcquired = currentSkills.includes(skill.id);
    const canLearn = skill.dependencies.every(dep => currentSkills.includes(dep));

    return (
      <List.Item key={skill.id}>
        <Card
          hoverable
          style={{ width: '100%' }}
          actions={[
            isAcquired ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>Mastered</Tag>
            ) : canLearn ? (
              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={() => startLearning(skill)}
              >
                Learn Skill
              </Button>
            ) : (
              <Tag color="default">Prerequisites Required</Tag>
            )
          ]}
        >
          <Card.Meta
            avatar={<Badge count={isAcquired ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 0}>
              <div style={{ fontSize: 32 }}>{getSkillIcon(skill.category)}</div>
            </Badge>}
            title={skill.name}
            description={skill.description}
          />

          <div style={{ marginTop: 16 }}>
            <Tag color="blue">{skill.category}</Tag>
            <Tag>{skill.practiceExercises.length} exercises</Tag>
            <Tag>{skill.learningResources.length} resources</Tag>
          </div>

          {skill.dependencies.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Dependencies:</strong>
              <div>
                {skill.dependencies.map(dep => (
                  <Tag
                    key={dep}
                    color={currentSkills.includes(dep) ? 'success' : 'default'}
                  >
                    {dep}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Card>
      </List.Item>
    );
  };

  const renderLearningModal = () => {
    if (!selectedSkill || !learningProgress) return null;

    const workflow = DeepSeekSkillAcquisitionService.getSkillAcquisitionWorkflow();

    return (
      <Modal
        title={`Learning: ${selectedSkill.name}`}
        visible={showLearningModal}
        onCancel={() => setShowLearningModal(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setShowLearningModal(false)}>
            Cancel Learning
          </Button>,
          <Button
            key="complete"
            type="primary"
            onClick={() => completeSkill(selectedSkill.id)}
          >
            Mark as Mastered
          </Button>
        ]}
      >
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Category">
                <Tag color="blue">{selectedSkill.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedSkill.description}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={learningProgress.status === 'mastered' ? 'success' : 'processing'}>
                  {learningProgress.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Practice Attempts">
                {learningProgress.practiceAttempts}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Learning Path" key="path">
            <Steps direction="vertical" current={workflow.stages.findIndex(s => s.id === learningProgress.currentStage)}>
              {workflow.stages.map((stage, idx) => (
                <Step
                  key={stage.id}
                  title={stage.name}
                  description={stage.description}
                  status={
                    learningProgress.completedStages.includes(stage.id) ? 'finish' :
                    learningProgress.currentStage === stage.id ? 'process' :
                    'wait'
                  }
                />
              ))}
            </Steps>
          </TabPane>

          <TabPane tab="Learning Resources" key="resources">
            <List
              dataSource={selectedSkill.learningResources}
              renderItem={(resource) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<BookOutlined style={{ fontSize: 24 }} />}
                    title={resource.title}
                    description={
                      <>
                        <Tag>{resource.type}</Tag>
                        <Progress
                          percent={resource.relevanceScore * 100}
                          size="small"
                          style={{ width: 200, marginLeft: 8 }}
                        />
                      </>
                    }
                  />
                  {resource.url && (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      View Resource
                    </a>
                  )}
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Practice Exercises" key="practice">
            <List
              dataSource={selectedSkill.practiceExercises}
              renderItem={(exercise) => (
                <Card type="inner" style={{ marginBottom: 16 }}>
                  <h4>{exercise.id.replace(/-/g, ' ').toUpperCase()}</h4>
                  <Tag color={
                    exercise.difficulty === 'beginner' ? 'green' :
                    exercise.difficulty === 'intermediate' ? 'orange' :
                    'red'
                  }>
                    {exercise.difficulty}
                  </Tag>
                  <p>{exercise.description}</p>
                  
                  <div style={{ marginTop: 12 }}>
                    <strong>Example Input:</strong>
                    <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                      {JSON.stringify(exercise.inputs, null, 2)}
                    </pre>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <strong>Expected Output:</strong>
                    <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                      {JSON.stringify(exercise.expectedOutput, null, 2)}
                    </pre>
                  </div>

                  <Button type="primary" style={{ marginTop: 12 }}>
                    Attempt Exercise
                  </Button>
                </Card>
              )}
            />
          </TabPane>

          <TabPane tab="Validation" key="validation">
            <h4>Validation Criteria:</h4>
            <List
              dataSource={selectedSkill.validationCriteria}
              renderItem={(criterion) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                    title={criterion.name}
                    description={
                      <>
                        <div>{criterion.test}</div>
                        <Progress
                          percent={criterion.passingScore}
                          status="active"
                          style={{ marginTop: 8 }}
                        />
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>

        <Card style={{ marginTop: 16, background: '#f0f9ff' }}>
          <h4>💡 Quick Tip:</h4>
          <p>
            Follow the learning path step by step. Start with the learning resources, 
            then practice with the exercises, and finally validate your mastery against 
            the criteria. Each skill builds upon previous knowledge!
          </p>
        </Card>
      </Modal>
    );
  };

  const renderSkillAcquisitionWorkflow = () => {
    const workflow = DeepSeekSkillAcquisitionService.getSkillAcquisitionWorkflow();

    return (
      <Card title="How DeepSeek Acquires New Skills">
        <p style={{ marginBottom: 24 }}>
          This meta-workflow defines the process DeepSeek follows to learn any new skill:
        </p>

        <Timeline>
          {workflow.stages.map((stage, idx) => (
            <Timeline.Item
              key={stage.id}
              color={idx === 0 ? 'green' : idx === workflow.stages.length - 1 ? 'blue' : 'gray'}
            >
              <h4>{stage.name}</h4>
              <p>{stage.description}</p>
              
              <div style={{ marginTop: 8 }}>
                <strong>Actions:</strong>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {stage.actions.map((action, actionIdx) => (
                    <li key={actionIdx}>{action}</li>
                  ))}
                </ul>
              </div>

              {stage.outputs && stage.outputs.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Outputs:</strong>
                  <div>
                    {stage.outputs.map((output, outputIdx) => (
                      <Tag key={outputIdx}>{output}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </Timeline.Item>
          ))}
        </Timeline>

        <Card type="inner" style={{ marginTop: 24, background: '#fffbe6' }}>
          <h4>🎓 Key Principles:</h4>
          <ul>
            <li><strong>Structured Learning:</strong> Follow a clear path from foundation to mastery</li>
            <li><strong>Practice-Based:</strong> Learn by doing, not just reading</li>
            <li><strong>Validation:</strong> Test knowledge against defined criteria</li>
            <li><strong>Documentation:</strong> Create documentation for future reference</li>
            <li><strong>Integration:</strong> Make skills available in workflows</li>
          </ul>
        </Card>
      </Card>
    );
  };

  const recommendedSkills = DeepSeekSkillAcquisitionService.getRecommendedSkills(currentSkills);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="DeepSeek Skills Management"
        extra={
          <Space>
            <Tag color="purple">AI Learning System</Tag>
            <Badge count={currentSkills.length} showZero>
              <Tag>Mastered Skills</Tag>
            </Badge>
          </Space>
        }
      >
        <Tabs defaultActiveKey="available">
          <TabPane tab={`Available Skills (${skills.length})`} key="available">
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
              dataSource={skills}
              renderItem={renderSkillCard}
            />
          </TabPane>

          <TabPane tab={`Recommended (${recommendedSkills.length})`} key="recommended">
            <Card style={{ marginBottom: 16, background: '#f0f9ff' }}>
              <h4>📚 Recommended Skills</h4>
              <p>
                These skills are ready to learn based on your current capabilities. 
                All prerequisites are met!
              </p>
            </Card>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
              dataSource={recommendedSkills}
              renderItem={renderSkillCard}
            />
          </TabPane>

          <TabPane tab="Acquisition Workflow" key="workflow">
            {renderSkillAcquisitionWorkflow()}
          </TabPane>

          <TabPane tab={`My Skills (${currentSkills.length})`} key="my-skills">
            <List
              dataSource={currentSkills}
              renderItem={(skillId) => (
                <List.Item>
                  <Card style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginRight: 12 }} />
                        <strong>{skillId.replace(/-/g, ' ').toUpperCase()}</strong>
                      </div>
                      <Tag color="success">Mastered</Tag>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>

        {renderLearningModal()}
      </Card>
    </div>
  );
};

export default DeepSeekSkillsDashboard;

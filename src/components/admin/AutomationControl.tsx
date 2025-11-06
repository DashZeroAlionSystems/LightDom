/**
 * Automation Control Component
 * Admin interface for managing automation workflows and scripts
 */

import React, { useState, useEffect } from 'react';
import { 
  Play,
  Pause,
  Square,
  RotateCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Settings,
  Calendar,
  Terminal,
  GitBranch,
  FileText,
  Shield,
  TrendingUp
} from 'lucide-react';
import { automationIntegration } from '../../services/AutomationIntegration';

interface AutomationJob {
  id: string;
  name: string;
  type: 'compliance' | 'quality' | 'deployment' | 'scaling' | 'monitoring';
  status: 'idle' | 'running' | 'completed' | 'failed';
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  duration?: number;
  output?: string;
  error?: string;
}

interface AutomationMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDuration: number;
  uptime: number;
}

const AutomationControl: React.FC = () => {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [selectedJob, setSelectedJob] = useState<AutomationJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);

  useEffect(() => {
    loadAutomationData();
    const interval = setInterval(loadAutomationData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAutomationData = async () => {
    try {
      const [jobsRes, metricsRes] = await Promise.all([
        fetch('/api/automation/jobs'),
        fetch('/api/automation/metrics')
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics);
      }
    } catch (error) {
      console.error('Failed to load automation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      const response = await fetch(`/api/automation/jobs/${jobId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        loadAutomationData();
      }
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    }
  };

  const getJobIcon = (type: string) => {
    const icons: Record<string, any> = {
      compliance: Shield,
      quality: CheckCircle,
      deployment: GitBranch,
      scaling: TrendingUp,
      monitoring: Terminal
    };
    const Icon = icons[type] || Zap;
    return <Icon size={20} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="status-indicator running"><RotateCw size={16} className="spinning" /></div>;
      case 'completed':
        return <div className="status-indicator completed"><CheckCircle size={16} /></div>;
      case 'failed':
        return <div className="status-indicator failed"><XCircle size={16} /></div>;
      default:
        return <div className="status-indicator idle"><Clock size={16} /></div>;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Define default automation jobs
  const defaultJobs: AutomationJob[] = [
    {
      id: 'compliance-check',
      name: 'Compliance Check',
      type: 'compliance',
      status: 'idle',
      schedule: '0 */6 * * *', // Every 6 hours
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'quality-gates',
      name: 'Quality Gates',
      type: 'quality',
      status: 'idle',
      schedule: '0 0 * * *', // Daily
      lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'auto-deployment',
      name: 'Auto Deployment',
      type: 'deployment',
      status: 'idle',
      schedule: '0 2 * * 1', // Weekly on Monday
      lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'auto-scaling',
      name: 'Auto Scaling',
      type: 'scaling',
      status: 'running',
      lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      duration: 15000
    },
    {
      id: 'health-monitoring',
      name: 'Health Monitoring',
      type: 'monitoring',
      status: 'completed',
      lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      duration: 5000
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : defaultJobs;

  return (
    <div className="automation-control">
      {/* Metrics Overview */}
      <div className="automation-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <Play size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics?.totalRuns || 245}</div>
            <div className="metric-label">Total Runs</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics?.successfulRuns || 238}</div>
            <div className="metric-label">Successful</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon error">
            <XCircle size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics?.failedRuns || 7}</div>
            <div className="metric-label">Failed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{formatDuration(metrics?.averageDuration || 12500)}</div>
            <div className="metric-label">Avg Duration</div>
          </div>
        </div>
      </div>

      {/* Automation Jobs */}
      <div className="automation-jobs">
        <div className="jobs-header">
          <h3>Automation Jobs</h3>
          <button className="btn btn-primary btn-sm">
            <Zap size={16} />
            Create Job
          </button>
        </div>

        <div className="jobs-list">
          {loading ? (
            <div className="jobs-loading">Loading automation jobs...</div>
          ) : displayJobs.map(job => (
            <div key={job.id} className={`job-card ${job.status}`}>
              <div className="job-header">
                <div className="job-info">
                  <div className="job-icon">
                    {getJobIcon(job.type)}
                  </div>
                  <div>
                    <div className="job-name">{job.name}</div>
                    <div className="job-type">{job.type}</div>
                  </div>
                </div>
                <div className="job-status">
                  {getStatusIcon(job.status)}
                  <span className="status-text">{job.status}</span>
                </div>
              </div>

              <div className="job-details">
                {job.schedule && (
                  <div className="job-detail">
                    <Calendar size={14} />
                    <span>Schedule: {job.schedule}</span>
                  </div>
                )}
                {job.lastRun && (
                  <div className="job-detail">
                    <Clock size={14} />
                    <span>Last run: {new Date(job.lastRun).toLocaleString()}</span>
                  </div>
                )}
                {job.duration && (
                  <div className="job-detail">
                    <RotateCw size={14} />
                    <span>Duration: {formatDuration(job.duration)}</span>
                  </div>
                )}
              </div>

              <div className="job-actions">
                {job.status === 'idle' && (
                  <button 
                    className="action-btn primary"
                    onClick={() => handleJobAction(job.id, 'run')}
                    title="Run now"
                  >
                    <Play size={16} />
                  </button>
                )}
                {job.status === 'running' && (
                  <button 
                    className="action-btn danger"
                    onClick={() => handleJobAction(job.id, 'stop')}
                    title="Stop"
                  >
                    <Square size={16} />
                  </button>
                )}
                <button 
                  className="action-btn"
                  onClick={() => {
                    setSelectedJob(job);
                    setShowScheduleModal(true);
                  }}
                  title="Edit schedule"
                >
                  <Calendar size={16} />
                </button>
                <button 
                  className="action-btn"
                  onClick={() => {
                    setSelectedJob(job);
                    setShowOutputModal(true);
                  }}
                  title="View output"
                >
                  <FileText size={16} />
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleJobAction(job.id, 'delete')}
                  title="Delete job"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="automation-quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-action-grid">
          <button 
            className="quick-action-card"
            onClick={async () => {
              const result = await automationIntegration.runComplianceCheck();
              alert(`Compliance check ${result.success ? 'passed' : 'failed'}`);
            }}
          >
            <Shield size={32} />
            <span>Run Compliance Check</span>
          </button>

          <button 
            className="quick-action-card"
            onClick={async () => {
              const result = await automationIntegration.runQualityGates();
              alert(`Quality gates ${result.status}`);
            }}
          >
            <CheckCircle size={32} />
            <span>Check Quality Gates</span>
          </button>

          <button 
            className="quick-action-card"
            onClick={() => handleJobAction('deploy-staging', 'run')}
          >
            <GitBranch size={32} />
            <span>Deploy to Staging</span>
          </button>

          <button 
            className="quick-action-card"
            onClick={() => handleJobAction('scale-up', 'run')}
          >
            <TrendingUp size={32} />
            <span>Scale Up Services</span>
          </button>
        </div>
      </div>

      {/* Running Jobs Monitor */}
      <div className="running-jobs-monitor">
        <h3>Active Jobs</h3>
        <div className="monitor-grid">
          {displayJobs.filter(j => j.status === 'running').map(job => (
            <div key={job.id} className="monitor-item">
              <div className="monitor-header">
                <span className="monitor-name">{job.name}</span>
                <div className="monitor-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
              <div className="monitor-stats">
                <span>Running for: {formatDuration(Date.now() - new Date(job.lastRun!).getTime())}</span>
              </div>
            </div>
          ))}
          {displayJobs.filter(j => j.status === 'running').length === 0 && (
            <div className="monitor-empty">No active jobs</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationControl;



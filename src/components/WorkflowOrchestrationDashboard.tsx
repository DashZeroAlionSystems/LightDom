/**
 * WorkflowOrchestrationDashboard Component
 * 
 * A comprehensive CRUD dashboard for managing the hierarchical workflow system:
 * Campaigns → Workflows → Services → Data Streams → Attributes
 * 
 * Features:
 * - Hierarchical navigation with breadcrumbs
 * - Add/Edit/Delete for all entity types
 * - DeepSeek integration for attribute suggestions
 * - n8n-compatible workflow triggers
 * - Auto-bundling workflow creation
 */

import React, { useState, useEffect, useCallback } from 'react';

// Types
interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  triggers: Trigger[];
  workflows?: Workflow[];
  createdAt: string;
  updatedAt: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  campaignId: string | null;
  triggers: Trigger[];
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  status: string;
  workflowId: string | null;
  type: string;
  endpoint: string | null;
  dataStreams?: DataStream[];
  createdAt: string;
  updatedAt: string;
}

interface DataStream {
  id: string;
  name: string;
  description: string;
  status: string;
  serviceId: string | null;
  sourceType: string;
  destinationType: string;
  attributes?: Attribute[];
  createdAt: string;
  updatedAt: string;
}

interface Attribute {
  id: string;
  name: string;
  label: string;
  description: string;
  dataStreamId: string | null;
  type: string;
  category: string;
  generatedByDeepSeek: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Trigger {
  type: string;
  enabled: boolean;
  cron?: string;
}

interface Statistics {
  campaigns: number;
  workflows: number;
  services: number;
  dataStreams: number;
  attributes: number;
}

// Navigation levels
type EntityLevel = 'campaigns' | 'workflows' | 'services' | 'dataStreams' | 'attributes';

interface BreadcrumbItem {
  level: EntityLevel;
  id?: string;
  name: string;
}

// API base URL
const API_BASE = '/api/workflow-orchestration';

// Styles
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#333',
    margin: 0
  },
  breadcrumb: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  breadcrumbItem: {
    cursor: 'pointer',
    color: '#1890ff',
    fontSize: '14px'
  },
  breadcrumbSeparator: {
    color: '#999',
    fontSize: '14px'
  },
  breadcrumbCurrent: {
    color: '#333',
    fontWeight: 'bold' as const,
    fontSize: '14px'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: '#1890ff'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const,
    transition: 'all 0.2s'
  },
  primaryButton: {
    backgroundColor: '#1890ff',
    color: '#fff'
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    color: '#333'
  },
  successButton: {
    backgroundColor: '#52c41a',
    color: '#fff'
  },
  dangerButton: {
    backgroundColor: '#ff4d4f',
    color: '#fff'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent'
  },
  cardHover: {
    borderColor: '#1890ff',
    transform: 'translateY(-2px)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#333',
    margin: 0
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
    lineHeight: '1.4'
  },
  cardMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#999'
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500' as const
  },
  badgeDraft: {
    backgroundColor: '#f0f0f0',
    color: '#666'
  },
  badgeActive: {
    backgroundColor: '#e6f7ff',
    color: '#1890ff'
  },
  badgeCompleted: {
    backgroundColor: '#f6ffed',
    color: '#52c41a'
  },
  badgePaused: {
    backgroundColor: '#fffbe6',
    color: '#faad14'
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    margin: 0
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d9d9d9',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d9d9d9',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d9d9d9',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    color: '#666'
  },
  deepseekBadge: {
    backgroundColor: '#722ed1',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    marginLeft: '8px'
  }
};

// Component
export const WorkflowOrchestrationDashboard: React.FC = () => {
  // State
  const [currentLevel, setCurrentLevel] = useState<EntityLevel>('campaigns');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ level: 'campaigns', name: 'Campaigns' }]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  
  // Entity states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dataStreams, setDataStreams] = useState<DataStream[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  
  // Current parent context
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [currentDataStreamId, setCurrentDataStreamId] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/statistics`);
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  }, []);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/campaigns`);
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
    setLoading(false);
  }, []);

  // Fetch workflows for a campaign
  const fetchWorkflows = useCallback(async (campaignId: string | null) => {
    setLoading(true);
    try {
      const url = campaignId 
        ? `${API_BASE}/workflows?campaignId=${campaignId}`
        : `${API_BASE}/workflows`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.workflows);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
    setLoading(false);
  }, []);

  // Fetch services for a workflow
  const fetchServices = useCallback(async (workflowId: string | null) => {
    setLoading(true);
    try {
      const url = workflowId 
        ? `${API_BASE}/services?workflowId=${workflowId}`
        : `${API_BASE}/services`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
    setLoading(false);
  }, []);

  // Fetch data streams for a service
  const fetchDataStreams = useCallback(async (serviceId: string | null) => {
    setLoading(true);
    try {
      const url = serviceId 
        ? `${API_BASE}/data-streams?serviceId=${serviceId}`
        : `${API_BASE}/data-streams`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setDataStreams(data.dataStreams);
      }
    } catch (error) {
      console.error('Failed to fetch data streams:', error);
    }
    setLoading(false);
  }, []);

  // Fetch attributes for a data stream
  const fetchAttributes = useCallback(async (dataStreamId: string | null) => {
    setLoading(true);
    try {
      const url = dataStreamId 
        ? `${API_BASE}/attributes?dataStreamId=${dataStreamId}`
        : `${API_BASE}/attributes`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAttributes(data.attributes);
      }
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatistics();
    fetchCampaigns();
  }, [fetchStatistics, fetchCampaigns]);

  // Navigate to a level
  const navigateTo = (level: EntityLevel, id?: string, name?: string) => {
    const newBreadcrumbs: BreadcrumbItem[] = [{ level: 'campaigns', name: 'Campaigns' }];
    
    switch (level) {
      case 'campaigns':
        setCurrentLevel('campaigns');
        setCurrentCampaignId(null);
        fetchCampaigns();
        break;
      case 'workflows':
        if (id && name) {
          newBreadcrumbs.push({ level: 'workflows', id, name });
        }
        setCurrentLevel('workflows');
        setCurrentCampaignId(id || null);
        fetchWorkflows(id || null);
        break;
      case 'services':
        if (currentCampaignId) {
          const campaign = campaigns.find(c => c.id === currentCampaignId);
          if (campaign) {
            newBreadcrumbs.push({ level: 'workflows', id: currentCampaignId, name: campaign.name });
          }
        }
        if (id && name) {
          newBreadcrumbs.push({ level: 'services', id, name });
        }
        setCurrentLevel('services');
        setCurrentWorkflowId(id || null);
        fetchServices(id || null);
        break;
      case 'dataStreams':
        if (currentCampaignId) {
          const campaign = campaigns.find(c => c.id === currentCampaignId);
          if (campaign) {
            newBreadcrumbs.push({ level: 'workflows', id: currentCampaignId, name: campaign.name });
          }
        }
        if (currentWorkflowId) {
          const workflow = workflows.find(w => w.id === currentWorkflowId);
          if (workflow) {
            newBreadcrumbs.push({ level: 'services', id: currentWorkflowId, name: workflow.name });
          }
        }
        if (id && name) {
          newBreadcrumbs.push({ level: 'dataStreams', id, name });
        }
        setCurrentLevel('dataStreams');
        setCurrentServiceId(id || null);
        fetchDataStreams(id || null);
        break;
      case 'attributes':
        if (currentCampaignId) {
          const campaign = campaigns.find(c => c.id === currentCampaignId);
          if (campaign) {
            newBreadcrumbs.push({ level: 'workflows', id: currentCampaignId, name: campaign.name });
          }
        }
        if (currentWorkflowId) {
          const workflow = workflows.find(w => w.id === currentWorkflowId);
          if (workflow) {
            newBreadcrumbs.push({ level: 'services', id: currentWorkflowId, name: workflow.name });
          }
        }
        if (currentServiceId) {
          const service = services.find(s => s.id === currentServiceId);
          if (service) {
            newBreadcrumbs.push({ level: 'dataStreams', id: currentServiceId, name: service.name });
          }
        }
        if (id && name) {
          newBreadcrumbs.push({ level: 'attributes', id, name });
        }
        setCurrentLevel('attributes');
        setCurrentDataStreamId(id || null);
        fetchAttributes(id || null);
        break;
    }
    
    setBreadcrumbs(newBreadcrumbs);
  };

  // Open create modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      type: currentLevel === 'services' ? 'api' : currentLevel === 'dataStreams' ? 'api' : 'string',
      category: 'seo'
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (item: any) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = currentLevel === 'dataStreams' ? 'data-streams' : currentLevel;
      let url = `${API_BASE}/${endpoint}`;
      let method = 'POST';
      let body: any = { ...formData };
      
      if (modalMode === 'edit') {
        url = `${API_BASE}/${endpoint}/${editingItem.id}`;
        method = 'PUT';
      } else {
        // Add parent reference for new items
        switch (currentLevel) {
          case 'workflows':
            body.campaignId = currentCampaignId;
            break;
          case 'services':
            body.workflowId = currentWorkflowId;
            break;
          case 'dataStreams':
            body.serviceId = currentServiceId;
            break;
          case 'attributes':
            body.dataStreamId = currentDataStreamId;
            break;
        }
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        // Refresh current list
        switch (currentLevel) {
          case 'campaigns':
            fetchCampaigns();
            break;
          case 'workflows':
            fetchWorkflows(currentCampaignId);
            break;
          case 'services':
            fetchServices(currentWorkflowId);
            break;
          case 'dataStreams':
            fetchDataStreams(currentServiceId);
            break;
          case 'attributes':
            fetchAttributes(currentDataStreamId);
            break;
        }
        fetchStatistics();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
    setLoading(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const endpoint = currentLevel === 'dataStreams' ? 'data-streams' : currentLevel;
      const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh current list
        switch (currentLevel) {
          case 'campaigns':
            fetchCampaigns();
            break;
          case 'workflows':
            fetchWorkflows(currentCampaignId);
            break;
          case 'services':
            fetchServices(currentWorkflowId);
            break;
          case 'dataStreams':
            fetchDataStreams(currentServiceId);
            break;
          case 'attributes':
            fetchAttributes(currentDataStreamId);
            break;
        }
        fetchStatistics();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
    setLoading(false);
  };

  // Generate attributes with DeepSeek
  const generateAttributes = async (topic: string) => {
    if (!currentDataStreamId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/data-streams/${currentDataStreamId}/generate-attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category: 'seo' })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchAttributes(currentDataStreamId);
        fetchStatistics();
        alert(`Generated ${data.count} attributes for "${topic}"`);
      }
    } catch (error) {
      console.error('Failed to generate attributes:', error);
    }
    setLoading(false);
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { ...styles.badge, ...styles.badgeActive };
      case 'completed':
        return { ...styles.badge, ...styles.badgeCompleted };
      case 'paused':
        return { ...styles.badge, ...styles.badgePaused };
      default:
        return { ...styles.badge, ...styles.badgeDraft };
    }
  };

  // Get current items based on level
  const getCurrentItems = () => {
    switch (currentLevel) {
      case 'campaigns':
        return campaigns;
      case 'workflows':
        return workflows;
      case 'services':
        return services;
      case 'dataStreams':
        return dataStreams;
      case 'attributes':
        return attributes;
      default:
        return [];
    }
  };

  // Get add button label
  const getAddButtonLabel = () => {
    switch (currentLevel) {
      case 'campaigns':
        return '+ Add Campaign';
      case 'workflows':
        return '+ Add Workflow';
      case 'services':
        return '+ Add Service';
      case 'dataStreams':
        return '+ Add Data Stream';
      case 'attributes':
        return '+ Add Attribute';
      default:
        return '+ Add';
    }
  };

  // Render card based on level
  const renderCard = (item: any) => {
    const handleCardClick = () => {
      switch (currentLevel) {
        case 'campaigns':
          navigateTo('workflows', item.id, item.name);
          break;
        case 'workflows':
          navigateTo('services', item.id, item.name);
          break;
        case 'services':
          navigateTo('dataStreams', item.id, item.name);
          break;
        case 'dataStreams':
          navigateTo('attributes', item.id, item.name);
          break;
      }
    };

    return (
      <div
        key={item.id}
        style={styles.card}
        onClick={currentLevel !== 'attributes' ? handleCardClick : undefined}
      >
        <div style={styles.cardHeader}>
          <div>
            <h3 style={styles.cardTitle}>
              {item.name || item.label}
              {item.generatedByDeepSeek && (
                <span style={styles.deepseekBadge}>DeepSeek</span>
              )}
            </h3>
          </div>
          <span style={getStatusBadgeStyle(item.status)}>
            {item.status}
          </span>
        </div>
        <p style={styles.cardDescription}>
          {item.description || 'No description'}
        </p>
        <div style={styles.cardMeta}>
          {item.type && <span>Type: {item.type}</span>}
          {item.category && <span>Category: {item.category}</span>}
          <span>
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div style={{ ...styles.buttonGroup, marginTop: '12px' }}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
          >
            Edit
          </button>
          <button
            style={{ ...styles.button, ...styles.dangerButton }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  // Render form fields based on level
  const renderFormFields = () => {
    const commonFields = (
      <>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            style={styles.input}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.select}
            value={formData.status || 'draft'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </>
    );

    switch (currentLevel) {
      case 'services':
        return (
          <>
            {commonFields}
            <div style={styles.formGroup}>
              <label style={styles.label}>Service Type</label>
              <select
                style={styles.select}
                value={formData.type || 'api'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="api">API</option>
                <option value="webhook">Webhook</option>
                <option value="database">Database</option>
                <option value="file">File</option>
              </select>
            </div>
          </>
        );
      case 'dataStreams':
        return (
          <>
            {commonFields}
            <div style={styles.formGroup}>
              <label style={styles.label}>Source Type</label>
              <select
                style={styles.select}
                value={formData.sourceType || 'api'}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
              >
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="file">File</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Destination Type</label>
              <select
                style={styles.select}
                value={formData.destinationType || 'database'}
                onChange={(e) => setFormData({ ...formData, destinationType: e.target.value })}
              >
                <option value="database">Database</option>
                <option value="api">API</option>
                <option value="file">File</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
          </>
        );
      case 'attributes':
        return (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name (snake_case)</label>
              <input
                type="text"
                style={styles.input}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., h1_text"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Label</label>
              <input
                type="text"
                style={styles.input}
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., H1 Text"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data Type</label>
              <select
                style={styles.select}
                value={formData.type || 'string'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                style={styles.select}
                value={formData.category || 'seo'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="seo">SEO</option>
                <option value="content">Content</option>
                <option value="technical">Technical</option>
                <option value="analytics">Analytics</option>
                <option value="general">General</option>
              </select>
            </div>
          </>
        );
      default:
        return commonFields;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Workflow Orchestration Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => {
              fetchStatistics();
              switch (currentLevel) {
                case 'campaigns':
                  fetchCampaigns();
                  break;
                case 'workflows':
                  fetchWorkflows(currentCampaignId);
                  break;
                case 'services':
                  fetchServices(currentWorkflowId);
                  break;
                case 'dataStreams':
                  fetchDataStreams(currentServiceId);
                  break;
                case 'attributes':
                  fetchAttributes(currentDataStreamId);
                  break;
              }
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div style={styles.statsContainer}>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer' }} 
            onClick={() => navigateTo('campaigns')}
          >
            <div style={styles.statValue}>{statistics.campaigns}</div>
            <div style={styles.statLabel}>Campaigns</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{statistics.workflows}</div>
            <div style={styles.statLabel}>Workflows</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{statistics.services}</div>
            <div style={styles.statLabel}>Services</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{statistics.dataStreams}</div>
            <div style={styles.statLabel}>Data Streams</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{statistics.attributes}</div>
            <div style={styles.statLabel}>Attributes</div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span style={styles.breadcrumbSeparator}>›</span>}
            {index < breadcrumbs.length - 1 ? (
              <span
                style={styles.breadcrumbItem}
                onClick={() => {
                  if (crumb.level === 'campaigns') {
                    navigateTo('campaigns');
                  } else if (crumb.id) {
                    navigateTo(crumb.level, crumb.id, crumb.name);
                  }
                }}
              >
                {crumb.name}
              </span>
            ) : (
              <span style={styles.breadcrumbCurrent}>{crumb.name}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={openCreateModal}
          >
            {getAddButtonLabel()}
          </button>
          
          {currentLevel === 'attributes' && currentDataStreamId && (
            <button
              style={{ ...styles.button, ...styles.successButton }}
              onClick={() => {
                const topic = prompt('Enter topic for DeepSeek attribute generation (e.g., "h1", "meta", "title"):');
                if (topic) {
                  generateAttributes(topic);
                }
              }}
            >
              🤖 Generate with DeepSeek
            </button>
          )}
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          {getCurrentItems().length} items
          {loading && ' • Loading...'}
        </div>
      </div>

      {/* Content Grid */}
      {getCurrentItems().length > 0 ? (
        <div style={styles.grid}>
          {getCurrentItems().map(renderCard)}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <h3>No {currentLevel} found</h3>
          <p>Click the button above to create your first {currentLevel.slice(0, -1)}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modalMode === 'create' ? 'Create' : 'Edit'} {currentLevel.slice(0, -1)}
              </h2>
              <button
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            
            {renderFormFields()}
            
            <div style={styles.buttonGroup}>
              <button
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowOrchestrationDashboard;

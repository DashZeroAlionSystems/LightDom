/**
 * Blockchain Model Storage Dashboard
 * Admin interface for managing model training data on blockchain
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Database,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  AlertCircle,
  BarChart3,
  Users,
  Key,
  Globe,
  HardDrive,
  Cpu,
  Brain,
  Network,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Code,
  Link,
  Zap,
} from 'lucide-react';

interface ModelTrainingData {
  id: string;
  modelId: string;
  modelName: string;
  version: string;
  dataHash: string;
  metadata: {
    algorithm: string;
    framework: string;
    dataset: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingTime: number;
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
    lossFunction: string;
    validationSplit: number;
    features: string[];
    targetVariable: string;
    dataSize: number;
    preprocessing: string[];
    augmentation: string[];
    hyperparameters: Record<string, any>;
  };
  schema: {
    inputSchema: Record<string, any>;
    outputSchema: Record<string, any>;
    dataTypes: Record<string, string>;
    constraints: Record<string, any>;
    validationRules: string[];
  };
  connections: {
    parentModels: string[];
    childModels: string[];
    dependencies: string[];
    integrations: string[];
    apis: string[];
  };
  access: {
    adminAddresses: string[];
    readPermissions: string[];
    writePermissions: string[];
    encrypted: boolean;
    encryptionKey?: string;
  };
  blockchain: {
    transactionHash: string;
    blockNumber: number;
    gasUsed: number;
    timestamp: number;
    contractAddress: string;
  };
  ipfs: {
    dataCID: string;
    metadataCID: string;
    schemaCID: string;
    connectionsCID: string;
  };
  lifecycle: {
    created: number;
    lastUpdated: number;
    status: 'active' | 'deprecated' | 'archived' | 'deleted';
    versionHistory: string[];
  };
}

interface AdminAccess {
  address: string;
  role: 'super_admin' | 'admin' | 'data_admin' | 'model_admin';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    manageAccess: boolean;
    deployModels: boolean;
    accessTrainingData: boolean;
  };
  createdAt: number;
  lastActive: number;
  isActive: boolean;
}

const BlockchainModelStorageDashboard: React.FC = () => {
  const [models, setModels] = useState<ModelTrainingData[]>([]);
  const [adminAccess, setAdminAccess] = useState<AdminAccess[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<ModelTrainingData | null>(null);
  const [showAddModel, setShowAddModel] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAlgorithm, setFilterAlgorithm] = useState<string>('all');
  const [adminAddress, setAdminAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    if (!adminAddress) return;

    setIsLoading(true);
    try {
      // Load models
      const modelsResponse = await fetch(`/api/blockchain-models/all?adminAddress=${adminAddress}`);
      const modelsData = await modelsResponse.json();
      if (modelsData.success) {
        setModels(modelsData.data.models);
      }

      // Load admin access
      const adminResponse = await fetch(
        `/api/blockchain-models/admin/list?adminAddress=${adminAddress}`
      );
      const adminData = await adminResponse.json();
      if (adminData.success) {
        setAdminAccess(adminData.data.adminAccess);
      }

      // Load statistics
      const statsResponse = await fetch(
        `/api/blockchain-models/statistics?adminAddress=${adminAddress}`
      );
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStatistics(statsData.data.statistics);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-400',
      deprecated: 'text-yellow-400',
      archived: 'text-blue-400',
      deleted: 'text-red-400',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <Check size={16} />,
      deprecated: <AlertCircle size={16} />,
      archived: <HardDrive size={16} />,
      deleted: <Trash2 size={16} />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle size={16} />;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: 'text-red-400',
      admin: 'text-purple-400',
      data_admin: 'text-blue-400',
      model_admin: 'text-green-400',
    };
    return colors[role as keyof typeof colors] || 'text-gray-400';
  };

  const filteredModels = models.filter(model => {
    const matchesSearch =
      searchQuery === '' ||
      model.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.metadata.algorithm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || model.lifecycle.status === filterStatus;
    const matchesAlgorithm =
      filterAlgorithm === 'all' || model.metadata.algorithm === filterAlgorithm;

    return matchesSearch && matchesStatus && matchesAlgorithm;
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6'>
      {/* Header */}
      <div className='max-w-7xl mx-auto mb-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2'>
            Blockchain Model Storage
          </h1>
          <p className='text-slate-300 text-lg'>
            Secure storage of model training data with metadata, schema, and connections
          </p>
        </div>

        {/* Admin Address Input */}
        <div className='flex justify-center mb-8'>
          <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 w-full max-w-2xl'>
            <div className='flex items-center gap-4'>
              <Shield className='text-blue-400' size={24} />
              <div className='flex-1'>
                <label className='block text-sm font-medium mb-2'>Admin Address</label>
                <input
                  type='text'
                  placeholder='0x...'
                  value={adminAddress}
                  onChange={e => setAdminAddress(e.target.value)}
                  className='w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm'
                />
              </div>
              <button
                onClick={loadData}
                disabled={!adminAddress}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2'
              >
                <RefreshCw size={16} />
                Load Data
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between mb-4'>
                <Database className='text-blue-400' size={24} />
                <span className='text-2xl'>🧠</span>
              </div>
              <div className='text-3xl font-bold text-blue-400 mb-1'>{statistics.totalModels}</div>
              <div className='text-slate-400 text-sm'>Total Models</div>
            </div>

            <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between mb-4'>
                <Users className='text-green-400' size={24} />
                <span className='text-2xl'>👥</span>
              </div>
              <div className='text-3xl font-bold text-green-400 mb-1'>{adminAccess.length}</div>
              <div className='text-slate-400 text-sm'>Admin Users</div>
            </div>

            <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between mb-4'>
                <BarChart3 className='text-purple-400' size={24} />
                <span className='text-2xl'>📊</span>
              </div>
              <div className='text-3xl font-bold text-purple-400 mb-1'>{statistics.algorithms}</div>
              <div className='text-slate-400 text-sm'>Algorithms</div>
            </div>

            <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700'>
              <div className='flex items-center justify-between mb-4'>
                <HardDrive className='text-orange-400' size={24} />
                <span className='text-2xl'>💾</span>
              </div>
              <div className='text-3xl font-bold text-orange-400 mb-1'>
                {Math.floor(statistics.totalDataSize / 1024 / 1024)} MB
              </div>
              <div className='text-slate-400 text-sm'>Data Size</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className='flex justify-center gap-4 mb-8'>
          <button
            onClick={() => setShowAddModel(true)}
            disabled={!adminAddress}
            className='px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2'
          >
            <Plus size={20} />
            Add Model
          </button>

          <button
            onClick={() => setShowAddAdmin(true)}
            disabled={!adminAddress}
            className='px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2'
          >
            <Users size={20} />
            Add Admin
          </button>
        </div>

        {/* Filters */}
        <div className='flex justify-center gap-4 mb-8'>
          <div className='flex items-center gap-2'>
            <Search size={20} />
            <input
              type='text'
              placeholder='Search models...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm w-64'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className='bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm'
            >
              <option value='all'>All Status</option>
              <option value='active'>Active</option>
              <option value='deprecated'>Deprecated</option>
              <option value='archived'>Archived</option>
              <option value='deleted'>Deleted</option>
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <select
              value={filterAlgorithm}
              onChange={e => setFilterAlgorithm(e.target.value)}
              className='bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm'
            >
              <option value='all'>All Algorithms</option>
              <option value='neural_network'>Neural Network</option>
              <option value='random_forest'>Random Forest</option>
              <option value='svm'>SVM</option>
              <option value='gradient_boosting'>Gradient Boosting</option>
            </select>
          </div>
        </div>

        {/* Models List */}
        <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700'>
          <h3 className='text-xl font-bold mb-4 flex items-center gap-2'>
            <Database className='text-blue-400' />
            Stored Models ({filteredModels.length})
          </h3>

          {isLoading ? (
            <div className='text-center text-slate-400 py-8'>
              <RefreshCw className='animate-spin mx-auto mb-4' size={48} />
              <p>Loading models...</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className='text-center text-slate-400 py-8'>
              <Database size={48} className='mx-auto mb-4 opacity-50' />
              <p>No models found</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredModels.map(model => (
                <div
                  key={model.id}
                  className='bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-center gap-3'>
                      <Brain className='text-blue-400' size={20} />
                      <div>
                        <div className='font-semibold'>{model.modelName}</div>
                        <div className='text-sm text-slate-400'>
                          v{model.version} • {model.metadata.algorithm}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {getStatusIcon(model.lifecycle.status)}
                      <span className={`text-sm ${getStatusColor(model.lifecycle.status)}`}>
                        {model.lifecycle.status}
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3'>
                    <div>
                      <span className='text-slate-400'>Accuracy:</span>
                      <span className='ml-1 font-mono'>
                        {(model.metadata.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className='text-slate-400'>Framework:</span>
                      <span className='ml-1 font-mono'>{model.metadata.framework}</span>
                    </div>
                    <div>
                      <span className='text-slate-400'>Data Size:</span>
                      <span className='ml-1 font-mono'>
                        {Math.floor(model.metadata.dataSize / 1024)} KB
                      </span>
                    </div>
                    <div>
                      <span className='text-slate-400'>Training Time:</span>
                      <span className='ml-1 font-mono'>
                        {Math.floor(model.metadata.trainingTime / 60)}m
                      </span>
                    </div>
                  </div>

                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-slate-500'>
                      Block: {model.blockchain.blockNumber} • Gas: {model.blockchain.gasUsed}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setSelectedModel(model)}
                        className='px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs'
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          /* Handle edit */
                        }}
                        className='px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          /* Handle delete */
                        }}
                        className='px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model Details Modal */}
        {selectedModel && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-xl font-bold'>Model Details: {selectedModel.modelName}</h3>
                <button
                  onClick={() => setSelectedModel(null)}
                  className='text-slate-400 hover:text-white'
                >
                  <X size={24} />
                </button>
              </div>

              <div className='space-y-6'>
                {/* Basic Info */}
                <div>
                  <button
                    onClick={() => toggleSection('basic')}
                    className='flex items-center gap-2 text-lg font-semibold mb-2'
                  >
                    {expandedSections.has('basic') ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                    Basic Information
                  </button>
                  {expandedSections.has('basic') && (
                    <div className='bg-slate-700/50 rounded p-4 space-y-2'>
                      <div>
                        <span className='text-slate-400'>Model ID:</span> {selectedModel.modelId}
                      </div>
                      <div>
                        <span className='text-slate-400'>Version:</span> {selectedModel.version}
                      </div>
                      <div>
                        <span className='text-slate-400'>Algorithm:</span>{' '}
                        {selectedModel.metadata.algorithm}
                      </div>
                      <div>
                        <span className='text-slate-400'>Framework:</span>{' '}
                        {selectedModel.metadata.framework}
                      </div>
                      <div>
                        <span className='text-slate-400'>Status:</span>{' '}
                        {selectedModel.lifecycle.status}
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div>
                  <button
                    onClick={() => toggleSection('performance')}
                    className='flex items-center gap-2 text-lg font-semibold mb-2'
                  >
                    {expandedSections.has('performance') ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                    Performance Metrics
                  </button>
                  {expandedSections.has('performance') && (
                    <div className='bg-slate-700/50 rounded p-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div>
                        <div className='text-slate-400 text-sm'>Accuracy</div>
                        <div className='text-lg font-semibold'>
                          {(selectedModel.metadata.accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>Precision</div>
                        <div className='text-lg font-semibold'>
                          {(selectedModel.metadata.precision * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>Recall</div>
                        <div className='text-lg font-semibold'>
                          {(selectedModel.metadata.recall * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>F1 Score</div>
                        <div className='text-lg font-semibold'>
                          {(selectedModel.metadata.f1Score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Training Configuration */}
                <div>
                  <button
                    onClick={() => toggleSection('training')}
                    className='flex items-center gap-2 text-lg font-semibold mb-2'
                  >
                    {expandedSections.has('training') ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                    Training Configuration
                  </button>
                  {expandedSections.has('training') && (
                    <div className='bg-slate-700/50 rounded p-4 grid grid-cols-2 md:grid-cols-3 gap-4'>
                      <div>
                        <div className='text-slate-400 text-sm'>Epochs</div>
                        <div className='text-lg font-semibold'>{selectedModel.metadata.epochs}</div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>Batch Size</div>
                        <div className='text-lg font-semibold'>
                          {selectedModel.metadata.batchSize}
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>Learning Rate</div>
                        <div className='text-lg font-semibold'>
                          {selectedModel.metadata.learningRate}
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>Optimizer</div>
                        <div className='text-lg font-semibold'>
                          {selectedModel.metadata.optimizer}
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>Loss Function</div>
                        <div className='text-lg font-semibold'>
                          {selectedModel.metadata.lossFunction}
                        </div>
                      </div>
                      <div>
                        <div className='text-slate-400 text-sm'>Validation Split</div>
                        <div className='text-lg font-semibold'>
                          {(selectedModel.metadata.validationSplit * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Blockchain Info */}
                <div>
                  <button
                    onClick={() => toggleSection('blockchain')}
                    className='flex items-center gap-2 text-lg font-semibold mb-2'
                  >
                    {expandedSections.has('blockchain') ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                    Blockchain Information
                  </button>
                  {expandedSections.has('blockchain') && (
                    <div className='bg-slate-700/50 rounded p-4 space-y-2'>
                      <div>
                        <span className='text-slate-400'>Transaction Hash:</span>{' '}
                        {selectedModel.blockchain.transactionHash}
                      </div>
                      <div>
                        <span className='text-slate-400'>Block Number:</span>{' '}
                        {selectedModel.blockchain.blockNumber}
                      </div>
                      <div>
                        <span className='text-slate-400'>Gas Used:</span>{' '}
                        {selectedModel.blockchain.gasUsed}
                      </div>
                      <div>
                        <span className='text-slate-400'>Contract Address:</span>{' '}
                        {selectedModel.blockchain.contractAddress}
                      </div>
                      <div>
                        <span className='text-slate-400'>Timestamp:</span>{' '}
                        {new Date(selectedModel.blockchain.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* IPFS Info */}
                <div>
                  <button
                    onClick={() => toggleSection('ipfs')}
                    className='flex items-center gap-2 text-lg font-semibold mb-2'
                  >
                    {expandedSections.has('ipfs') ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                    IPFS Storage
                  </button>
                  {expandedSections.has('ipfs') && (
                    <div className='bg-slate-700/50 rounded p-4 space-y-2'>
                      <div>
                        <span className='text-slate-400'>Data CID:</span>{' '}
                        {selectedModel.ipfs.dataCID}
                      </div>
                      <div>
                        <span className='text-slate-400'>Metadata CID:</span>{' '}
                        {selectedModel.ipfs.metadataCID}
                      </div>
                      <div>
                        <span className='text-slate-400'>Schema CID:</span>{' '}
                        {selectedModel.ipfs.schemaCID}
                      </div>
                      <div>
                        <span className='text-slate-400'>Connections CID:</span>{' '}
                        {selectedModel.ipfs.connectionsCID}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainModelStorageDashboard;

/**
 * Testing Dashboard
 * Comprehensive testing interface for the LightDom platform
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  BarChart3, 
  Download, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Eye,
  AlertTriangle,
  Info,
  Zap,
  Database,
  Brain,
  Shield,
  Link,
  Users,
  Settings,
  Target,
  TrendingUp,
  FileText,
  Code,
  HardDrive,
  Cpu,
  Network
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
  skipped: number;
}

const TestingDashboard: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [testStats, setTestStats] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadTestResults();
  }, []);

  // Auto-refresh when tests are running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        loadTestResults();
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const loadTestResults = async () => {
    try {
      const response = await fetch('/api/tests/results');
      const data = await response.json();
      if (data.success) {
        setTestSuites(data.data.suites);
        setTestResults(data.data.results);
        calculateTestStats(data.data.results);
      }
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setTestSuites(data.data.testSuites);
        setTestResults(data.data.testSuites.flatMap((suite: TestSuite) => suite.tests));
        calculateTestStats(data.data.testSuites.flatMap((suite: TestSuite) => suite.tests));
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportTestResults = async () => {
    try {
      const response = await fetch('/api/tests/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-results.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting test results:', error);
    }
  };

  const calculateTestStats = (results: TestResult[]) => {
    const total = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    setTestStats({
      total,
      passed,
      failed,
      skipped,
      totalDuration,
      successRate
    });
  };

  const toggleSuiteExpansion = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName);
    } else {
      newExpanded.add(suiteName);
    }
    setExpandedSuites(newExpanded);
  };

  const getTestIcon = (testName: string) => {
    if (testName.includes('Client')) return <Users size={16} />;
    if (testName.includes('Cursor') || testName.includes('AI')) return <Brain size={16} />;
    if (testName.includes('Blockchain') || testName.includes('Storage')) return <Shield size={16} />;
    if (testName.includes('Workflow') || testName.includes('Simulation')) return <Activity size={16} />;
    if (testName.includes('Error') || testName.includes('Validation')) return <AlertTriangle size={16} />;
    if (testName.includes('End-to-End') || testName.includes('Integration')) return <Link size={16} />;
    return <Target size={16} />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      passed: 'text-green-400',
      failed: 'text-red-400',
      skipped: 'text-yellow-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      passed: <CheckCircle size={16} />,
      failed: <XCircle size={16} />,
      skipped: <Clock size={16} />
    };
    return icons[status as keyof typeof icons] || <Clock size={16} />;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getSuiteIcon = (suiteName: string) => {
    if (suiteName.includes('Client')) return <Users size={20} />;
    if (suiteName.includes('Cursor') || suiteName.includes('AI')) return <Brain size={20} />;
    if (suiteName.includes('Blockchain') || suiteName.includes('Storage')) return <Shield size={20} />;
    if (suiteName.includes('Workflow') || suiteName.includes('Simulation')) return <Activity size={20} />;
    if (suiteName.includes('Error') || suiteName.includes('Validation')) return <AlertTriangle size={20} />;
    if (suiteName.includes('End-to-End') || suiteName.includes('Integration')) return <Link size={20} />;
    return <Target size={20} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Testing Dashboard
          </h1>
          <p className="text-slate-300 text-lg">Comprehensive testing interface for the LightDom platform</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            {isRunning ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} />}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={loadTestResults}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh Results
          </button>
          
          <button
            onClick={exportTestResults}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Download size={20} />
            Export Results
          </button>
        </div>

        {/* Test Statistics */}
        {testStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Target className="text-blue-400" size={24} />
                <span className="text-2xl">🧪</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {testStats.total}
              </div>
              <div className="text-slate-400 text-sm">Total Tests</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="text-green-400" size={24} />
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {testStats.passed}
              </div>
              <div className="text-slate-400 text-sm">Passed</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <XCircle className="text-red-400" size={24} />
                <span className="text-2xl">❌</span>
              </div>
              <div className="text-3xl font-bold text-red-400 mb-1">
                {testStats.failed}
              </div>
              <div className="text-slate-400 text-sm">Failed</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Clock className="text-yellow-400" size={24} />
                <span className="text-2xl">⏸️</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {testStats.skipped}
              </div>
              <div className="text-slate-400 text-sm">Skipped</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-purple-400" size={24} />
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {testStats.successRate.toFixed(1)}%
              </div>
              <div className="text-slate-400 text-sm">Success Rate</div>
            </div>
          </div>
        )}

        {/* Test Suites */}
        <div className="space-y-6">
          {testSuites.map((suite, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  {getSuiteIcon(suite.name)}
                  <div>
                    <h3 className="text-xl font-bold">{suite.name}</h3>
                    <div className="text-sm text-slate-400">
                      {suite.passed} passed, {suite.failed} failed, {suite.skipped} skipped
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-400">
                    Duration: {formatDuration(suite.totalDuration)}
                  </div>
                  <button
                    onClick={() => toggleSuiteExpansion(suite.name)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {expandedSuites.has(suite.name) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    {expandedSuites.has(suite.name) ? 'Hide' : 'Show'} Tests
                  </button>
                </div>
              </div>

              {expandedSuites.has(suite.name) && (
                <div className="space-y-3">
                  {suite.tests.map((test, testIndex) => (
                    <div key={testIndex} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          {getTestIcon(test.name)}
                          <span className="font-semibold">{test.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          <span className={`text-sm ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                          <span className="text-sm text-slate-400">
                            {formatDuration(test.duration)}
                          </span>
                        </div>
                      </div>
                      
                      {test.error && (
                        <div className="bg-red-900/20 border border-red-500/20 rounded p-2 mt-2 text-sm text-red-300">
                          <strong>Error:</strong> {test.error}
                        </div>
                      )}
                      
                      {test.details && (
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              setSelectedTest(test);
                              setShowDetails(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Test Details Modal */}
        {selectedTest && showDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Test Details: {selectedTest.name}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className={`ml-2 ${getStatusColor(selectedTest.status)}`}>
                      {selectedTest.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Duration:</span>
                    <span className="ml-2 font-mono">{formatDuration(selectedTest.duration)}</span>
                  </div>
                </div>
                
                {selectedTest.error && (
                  <div>
                    <span className="text-slate-400">Error:</span>
                    <div className="bg-red-900/20 border border-red-500/20 rounded p-2 mt-1 text-sm text-red-300">
                      {selectedTest.error}
                    </div>
                  </div>
                )}
                
                {selectedTest.details && (
                  <div>
                    <span className="text-slate-400">Details:</span>
                    <pre className="bg-slate-900 rounded p-2 mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(selectedTest.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestingDashboard;

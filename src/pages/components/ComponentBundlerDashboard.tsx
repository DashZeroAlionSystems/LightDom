/**
 * Component Bundler Dashboard
 * 
 * Dashboard for creating and managing component bundles with:
 * - Component selector list with search and filters
 * - Bundling wizard with AI-powered configuration
 * - Mock data toggle for admin preview
 * - Save to database functionality
 * - Reuses Wizard pattern from workflow dashboard
 */

import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Package, Download } from 'lucide-react';
import { 
  Button,
  Input,
  Badge,
  NotImplementedWrapper,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui';
import { Wizard, WizardContent, WizardStepDescriptor } from '@/components/ui/Wizard';
import { PromptInput } from '@/components/ui/PromptInput';

interface ComponentData {
  id: string;
  name: string;
  type: 'workflow-panel' | 'stat-card' | 'chart' | 'form' | 'table';
  description?: string;
  implemented: boolean;
  mockDataAvailable?: boolean;
}

interface ComponentBundle {
  id: string;
  name: string;
  description: string;
  components: string[];
  createdAt: string;
  mockDataEnabled: boolean;
}

const ComponentBundlerDashboard: React.FC = () => {
  const [bundles, setBundles] = useState<ComponentBundle[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeWizardStep, setActiveWizardStep] = useState('selection');
  const [bundleConfig, setBundleConfig] = useState<{
    selectedComponents: string[];
    prompt: string;
    mockDataEnabled: boolean;
  }>({
    selectedComponents: [],
    prompt: '',
    mockDataEnabled: false,
  });
  const [generatedConfig, setGeneratedConfig] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const availableComponents: ComponentData[] = [
    { id: 'workflow-panel', name: 'Workflow Panel', type: 'workflow-panel', description: 'Display workflow status and controls', implemented: true, mockDataAvailable: true },
    { id: 'stat-card', name: 'Statistics Card', type: 'stat-card', description: 'Show key metrics and trends', implemented: true, mockDataAvailable: true },
    { id: 'data-table', name: 'Data Table', type: 'table', description: 'Tabular data display with sorting', implemented: true, mockDataAvailable: true },
    { id: 'line-chart', name: 'Line Chart', type: 'chart', description: 'Time series visualization', implemented: true, mockDataAvailable: true },
    { id: 'bar-chart', name: 'Bar Chart', type: 'chart', description: 'Categorical data comparison', implemented: false, mockDataAvailable: false },
    { id: 'user-form', name: 'User Form', type: 'form', description: 'User input collection', implemented: false, mockDataAvailable: false },
  ];

  const wizardSteps: WizardStepDescriptor[] = [
    {
      id: 'selection',
      title: 'Select Components',
      subtitle: 'Choose components to bundle',
      status: activeWizardStep === 'selection' ? 'active' : bundleConfig.selectedComponents.length > 0 ? 'completed' : 'pending',
    },
    {
      id: 'configure',
      title: 'Configure Bundle',
      subtitle: 'AI-powered setup',
      status: activeWizardStep === 'configure' ? 'active' : bundleConfig.prompt ? 'completed' : 'pending',
    },
    {
      id: 'preview',
      title: 'Preview & Save',
      subtitle: 'Review configuration',
      status: activeWizardStep === 'preview' ? 'active' : generatedConfig ? 'completed' : 'pending',
    },
  ];

  useEffect(() => {
    const mockBundles: ComponentBundle[] = [
      {
        id: 'bundle-1',
        name: 'Analytics Dashboard',
        description: 'Complete analytics with charts and stats',
        components: ['stat-card', 'line-chart'],
        createdAt: '2 hours ago',
        mockDataEnabled: true,
      },
    ];
    setBundles(mockBundles);
  }, []);

  const handleComponentToggle = (componentId: string) => {
    setBundleConfig(prev => ({
      ...prev,
      selectedComponents: prev.selectedComponents.includes(componentId)
        ? prev.selectedComponents.filter(c => c !== componentId)
        : [...prev.selectedComponents, componentId]
    }));
  };

  const handlePromptSend = async (prompt: string) => {
    setGenerating(true);
    setBundleConfig(prev => ({ ...prev, prompt }));

    try {
      const response = await fetch('/api/component-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          selectedComponents: bundleConfig.selectedComponents,
          mockDataEnabled: bundleConfig.mockDataEnabled,
        }),
      });

      if (response.ok) {
        const config = await response.json();
        setGeneratedConfig(config);
        setActiveWizardStep('preview');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate bundle. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateBundle = async () => {
    if (!generatedConfig) return;

    const newBundle: ComponentBundle = {
      id: \`bundle-\${Date.now()}\`,
      name: generatedConfig.name || 'New Bundle',
      description: generatedConfig.description || 'Component bundle',
      components: bundleConfig.selectedComponents,
      createdAt: 'Just now',
      mockDataEnabled: bundleConfig.mockDataEnabled,
    };
    
    setBundles(prev => [...prev, newBundle]);
    setShowWizard(false);
    setActiveWizardStep('selection');
    setBundleConfig({ selectedComponents: [], prompt: '', mockDataEnabled: false });
    setGeneratedConfig(null);
  };

  const filteredComponents = availableComponents.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-surface p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Component Bundler</h1>
          <p className="text-on-surface-variant mt-1">Create and manage reusable component bundles</p>
        </div>
        <Button variant="filled" onClick={() => setShowWizard(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Create Bundle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <Card key={bundle.id} variant="elevated">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{bundle.name}</CardTitle>
                  <p className="text-sm text-on-surface-variant mt-1">{bundle.description}</p>
                </div>
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {bundle.components.map(compId => {
                    const comp = availableComponents.find(c => c.id === compId);
                    return comp ? <Badge key={compId} variant="primary">{comp.name}</Badge> : null;
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>{bundle.createdAt}</span>
                  {bundle.mockDataEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />Mock Data
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <Wizard
              title="Create Component Bundle"
              description="Bundle components with AI-powered configuration"
              steps={wizardSteps}
              activeStepId={activeWizardStep}
              onStepChange={setActiveWizardStep}
              actions={<Button variant="text" onClick={() => setShowWizard(false)}>Cancel</Button>}
            >
              <WizardContent stepId="selection">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                      className="flex-1"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="rounded-lg border border-outline bg-surface px-3 py-2 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="workflow-panel">Panels</option>
                      <option value="chart">Charts</option>
                      <option value="table">Tables</option>
                    </select>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredComponents.map((component) => (
                      <NotImplementedWrapper key={component.id} isImplemented={component.implemented}>
                        <button
                          onClick={() => handleComponentToggle(component.id)}
                          disabled={!component.implemented}
                          className={\`w-full rounded-xl border-2 p-4 text-left transition-all \${
                            bundleConfig.selectedComponents.includes(component.id)
                              ? 'border-primary bg-primary-container/20'
                              : 'border-outline hover:bg-surface-container-highest'
                          }\`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-on-surface">{component.name}</h4>
                              <p className="text-sm text-on-surface-variant mt-1">{component.description}</p>
                              <Badge variant="outline" className="mt-2 text-xs">{component.type}</Badge>
                            </div>
                          </div>
                        </button>
                      </NotImplementedWrapper>
                    ))}
                  </div>

                  <div className="rounded-xl border border-outline bg-surface-container-high/50 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bundleConfig.mockDataEnabled}
                        onChange={(e) => setBundleConfig(prev => ({ ...prev, mockDataEnabled: e.target.checked }))}
                        className="h-5 w-5 rounded"
                      />
                      <div>
                        <span className="font-medium text-on-surface">Enable Mock Data</span>
                        <p className="text-sm text-on-surface-variant">Preview with sample data</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="filled"
                      onClick={() => setActiveWizardStep('configure')}
                      disabled={bundleConfig.selectedComponents.length === 0}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </WizardContent>

              <WizardContent stepId="configure">
                <div className="space-y-4">
                  <PromptInput
                    onSend={handlePromptSend}
                    loading={generating}
                    placeholder="Describe your bundle... (e.g., 'Analytics dashboard with real-time metrics')"
                  />
                  <div className="flex justify-between">
                    <Button variant="outlined" onClick={() => setActiveWizardStep('selection')}>← Back</Button>
                  </div>
                </div>
              </WizardContent>

              <WizardContent stepId="preview">
                <div className="space-y-4">
                  {generatedConfig && (
                    <div className="rounded-xl bg-surface-container-high p-4">
                      <h4 className="font-semibold text-on-surface">{generatedConfig.name || 'New Bundle'}</h4>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {generatedConfig.description || 'Component bundle'}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button variant="outlined" onClick={() => setActiveWizardStep('configure')}>← Back</Button>
                    <Button variant="filled" onClick={handleCreateBundle}>Create Bundle</Button>
                  </div>
                </div>
              </WizardContent>
            </Wizard>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentBundlerDashboard;

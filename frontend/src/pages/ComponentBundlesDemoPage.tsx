import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  TextArea,
} from '@/components/ui';
import {
  ComponentBundle,
  ComponentBundleComponentConfig,
  CreateComponentBundleRequest,
  fetchBundles,
  createBundle,
  deleteBundle,
  generateBundle,
} from '@/services/componentBundles';
import { Loader2, PackagePlus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';

const COMPONENTS_PLACEHOLDER = `[
  {
    "id": "traffic-card",
    "type": "stat-card",
    "config": {
      "label": "Traffic",
      "metric": "sessions",
      "delta": "+12%"
    }
  }
]`;

const ComponentBundlesDemoPage: React.FC = () => {
  const [bundles, setBundles] = useState<ComponentBundle[]>([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [creatingBundle, setCreatingBundle] = useState(false);
  const [generatingBundle, setGeneratingBundle] = useState(false);

  const [formState, setFormState] = useState({
    name: 'AI Ops Monitoring Bundle',
    description: 'Demo bundle combining stat cards, tables, and automation summaries.',
    componentsJson: COMPONENTS_PLACEHOLDER,
    mockDataEnabled: true,
  });

  const [generatorState, setGeneratorState] = useState({
    prompt: 'Build a bundle showing crawler SLA, schema coverage, and AI task queue metrics.',
    selectedComponents: 'stat-card,chart,table',
    mockDataEnabled: true,
  });

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    setLoadingBundles(true);
    try {
      const data = await fetchBundles();
      setBundles(data);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load bundles');
    } finally {
      setLoadingBundles(false);
    }
  };

  const parseComponents = (value: string): ComponentBundleComponentConfig[] | null => {
    try {
      const parsed = JSON.parse(value) as ComponentBundleComponentConfig[];
      if (!Array.isArray(parsed)) {
        throw new Error('Components must be an array');
      }
      return parsed;
    } catch (error) {
      toast.error(`Invalid components JSON: ${(error as Error).message}`);
      return null;
    }
  };

  const handleCreate = async () => {
    const components = parseComponents(formState.componentsJson);
    if (!components) return;

    const payload: CreateComponentBundleRequest = {
      name: formState.name,
      description: formState.description,
      components,
      mockDataEnabled: formState.mockDataEnabled,
    };

    setCreatingBundle(true);
    try {
      const bundle = await createBundle(payload);
      toast.success('Bundle created');
      setBundles((current) => [bundle, ...current]);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to create bundle');
    } finally {
      setCreatingBundle(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBundle(id);
      toast.success('Bundle deleted');
      setBundles((current) => current.filter((bundle) => bundle.id !== id));
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete bundle');
    }
  };

  const handleGenerate = async () => {
    if (!generatorState.prompt.trim()) {
      toast.error('Enter a prompt before generating');
      return;
    }

    setGeneratingBundle(true);
    try {
      const response = await generateBundle({
        prompt: generatorState.prompt,
        selectedComponents: generatorState.selectedComponents
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        mockDataEnabled: generatorState.mockDataEnabled,
      });

      setFormState((current) => ({
        ...current,
        name: response.name,
        description: response.description,
        componentsJson: JSON.stringify(response.components, null, 2),
        mockDataEnabled: response.mockData,
      }));
      toast.success('Generated bundle config');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to generate bundle');
    } finally {
      setGeneratingBundle(false);
    }
  };

  const metrics = useMemo(
    () => [
      {
        label: 'Total bundles',
        value: bundles.length,
        tone: 'primary' as const,
      },
      {
        label: 'Mock data enabled',
        value: bundles.filter((bundle) => bundle.mock_data_enabled).length,
        tone: 'secondary' as const,
      },
    ],
    [bundles],
  );

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/10 bg-surface-container-high p-6 shadow-level-1'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <PackagePlus className='h-4 w-4' />
              Component bundle orchestrator
            </div>
            <div>
              <h1 className='text-3xl font-semibold text-on-surface md:text-4xl'>Bundle management demo</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Manage reusable MD3 component bundles, preview mock data usage, and auto-generate configurations using the /api/component-bundles endpoints.
              </p>
            </div>
          </div>
          <div className='flex flex-wrap gap-3'>
            {metrics.map((metric) => (
              <Card key={metric.label} className='border-outline/15 bg-surface min-w-[160px]'>
                <CardContent className='flex flex-col gap-1 py-4'>
                  <span className='text-xs uppercase tracking-wide text-on-surface-variant/70'>{metric.label}</span>
                  <span className='text-2xl font-semibold text-on-surface'>{metric.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </header>

      <section className='grid gap-4 lg:grid-cols-[1.1fr,0.9fr]'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader className='flex items-center justify-between gap-3'>
            <CardTitle className='text-on-surface'>Create bundle</CardTitle>
            <Button
              leftIcon={creatingBundle ? <Loader2 className='h-4 w-4 animate-spin' /> : <PackagePlus className='h-4 w-4' />}
              onClick={handleCreate}
              disabled={creatingBundle}
            >
              {creatingBundle ? 'Creating…' : 'Create bundle'}
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Input
              label='Bundle name'
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder='Growth Insights Bundle'
            />
            <TextArea
              label='Description'
              rows={3}
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({ ...current, description: event.target.value }))
              }
              helperText='Optional summary surfaced in generated dashboards.'
            />
            <TextArea
              label='Components JSON'
              rows={10}
              value={formState.componentsJson}
              onChange={(event) =>
                setFormState((current) => ({ ...current, componentsJson: event.target.value }))
              }
              helperText='Provide component definitions matching backend schema.'
              className='font-mono text-xs'
            />
            <label className='flex items-center gap-2 text-sm text-on-surface'>
              <Checkbox
                checked={formState.mockDataEnabled}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    mockDataEnabled: event.currentTarget.checked,
                  }))
                }
              />
              Enable mock data
            </label>
          </CardContent>
        </Card>

        <Card className='border-outline/15 bg-surface'>
          <CardHeader className='flex items-center justify-between gap-3'>
            <CardTitle className='text-on-surface'>Generate bundle via AI</CardTitle>
            <Button
              variant='outlined'
              leftIcon={generatingBundle ? <Loader2 className='h-4 w-4 animate-spin' /> : <Sparkles className='h-4 w-4' />}
              onClick={handleGenerate}
              disabled={generatingBundle}
            >
              {generatingBundle ? 'Generating…' : 'Generate config'}
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            <TextArea
              label='Prompt'
              rows={6}
              value={generatorState.prompt}
              onChange={(event) =>
                setGeneratorState((current) => ({ ...current, prompt: event.target.value }))
              }
              placeholder='Describe the dashboard experience you want.'
            />
            <Input
              label='Selected components (comma separated)'
              value={generatorState.selectedComponents}
              onChange={(event) =>
                setGeneratorState((current) => ({ ...current, selectedComponents: event.target.value }))
              }
              placeholder='stat-card, chart, table'
            />
            <label className='flex items-center gap-2 text-sm text-on-surface'>
              <Checkbox
                checked={generatorState.mockDataEnabled}
                onChange={(event) =>
                  setGeneratorState((current) => ({
                    ...current,
                    mockDataEnabled: event.currentTarget.checked,
                  }))
                }
              />
              Include mock data suggestions
            </label>
            <p className='text-xs text-on-surface-variant/70'>Generation uses the /api/component-bundles/generate endpoint backed by DeepSeek.</p>
          </CardContent>
        </Card>
      </section>

      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='md3-title-medium text-on-surface'>Existing bundles</h2>
          <Button variant='text' leftIcon={<RefreshCw className='h-4 w-4' />} onClick={loadBundles} disabled={loadingBundles}>
            Refresh
          </Button>
        </div>
        <Card className='border-outline/15 bg-surface'>
          <CardContent className='space-y-3'>
            {loadingBundles && (
              <div className='flex items-center gap-2 text-sm text-on-surface-variant'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Loading bundles…
              </div>
            )}

            {!loadingBundles && bundles.length === 0 && (
              <p className='text-sm text-on-surface-variant'>No bundles created yet. Generate one above to get started.</p>
            )}

            {bundles.map((bundle) => (
              <Card key={bundle.id} className='border-outline/15 bg-surface-container-low'>
                <CardHeader className='flex items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <CardTitle className='text-on-surface'>{bundle.name}</CardTitle>
                    <p className='text-sm text-on-surface-variant/80'>{bundle.description}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant={bundle.mock_data_enabled ? 'secondary' : 'outline'}>
                      Mock data · {bundle.mock_data_enabled ? 'enabled' : 'disabled'}
                    </Badge>
                    <Button
                      variant='text'
                      size='sm'
                      leftIcon={<Trash2 className='h-4 w-4' />}
                      onClick={() => handleDelete(String(bundle.id))}
                    >
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-on-surface-variant'>
                  <div className='flex flex-wrap gap-2'>
                    <Badge variant='outline'>Components: {bundle.components.length}</Badge>
                    <Badge variant='outline'>Updated: {new Date(bundle.updated_at).toLocaleString()}</Badge>
                  </div>
                  <pre className='max-h-48 overflow-auto rounded-2xl bg-surface px-4 py-3 font-mono text-xs text-on-surface-variant'>
                    {JSON.stringify(bundle.components, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ComponentBundlesDemoPage;

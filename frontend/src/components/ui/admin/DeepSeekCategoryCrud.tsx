import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  ServiceActionBar,
  ServiceActionButton,
} from '..';

type ID = string;

interface ServiceItem {
  id: ID;
  name: string;
  baseEndpoint?: string;
  isEnabled?: boolean;
}

interface WorkflowItem {
  id: ID;
  name: string;
  isTemplate?: boolean;
}

interface CategoryItem {
  id: ID;
  name: string;
  description?: string;
  services: ServiceItem[];
  workflows: WorkflowItem[];
  tags?: string[];
  created_at?: string;
}

const defaultSeed: CategoryItem[] = [
  {
    id: 'cat-seo',
    name: 'SEO',
    description: 'Search & index optimization workflows and audits',
    services: [
      { id: 'svc-crawler', name: 'Crawler', baseEndpoint: '/api/crawler', isEnabled: true },
    ],
    workflows: [{ id: 'wf-seo-audit', name: 'SEO Audit' }],
    tags: ['seo', 'crawl'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-automation',
    name: 'Automation',
    description: 'Automation templates & orchestration (DeepSeek)',
    services: [{ id: 'svc-n8n', name: 'n8n (orchestrator)', baseEndpoint: '/api/n8n' }],
    workflows: [{ id: 'wf-automation-1', name: 'Content pipeline' }],
    tags: ['automation'],
    created_at: new Date().toISOString(),
  },
];

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * DeepSeekCategoryCrud
 * Minimal CRUD UI for categories -> services -> workflows mapping.
 * Uses local state + optional API calls (if backend exists at /api/...).
 */
export const DeepSeekCategoryCrud: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [editingId, setEditingId] = useState<ID | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Try to fetch categories from API, otherwise load seed
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch('/api/templates/meta/categories');
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          // Expect data to be an array of categories (fallback shape)
          if (Array.isArray(data)) {
            setCategories(data as CategoryItem[]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // ignore - fallback to seed
      }

      // fallback
      setCategories(defaultSeed);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const startCreate = () => {
    setCreateMode(true);
    setNewName('');
    setNewDescription('');
  };

  const cancelCreate = () => {
    setCreateMode(false);
    setNewName('');
    setNewDescription('');
  };

  const saveNew = async () => {
    const item: CategoryItem = {
      id: uid('cat'),
      name: newName || 'Untitled',
      description: newDescription,
      services: [],
      workflows: [],
      tags: [],
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setCategories(prev => [item, ...prev]);
    cancelCreate();

    // Try to persist - no known category-create API; attempt POST to /api/templates if available
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name, description: item.description }),
      });
    } catch (e) {
      // swallow - demo only
      console.debug('Create category (demo):', e);
    }
  };

  const startEdit = (id: ID) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    setEditingId(id);
    setNewName(target.name);
    setNewDescription(target.description ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setNewDescription('');
  };

  const saveEdit = async (id: ID) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, name: newName, description: newDescription } : c))
    );
    // Try persist
    try {
      await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDescription }),
      });
    } catch (e) {
      console.debug('Update category (demo):', e);
    }
    cancelEdit();
  };

  const deleteCategory = async (id: ID) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.debug('Delete category (demo):', e);
    }
  };

  const attachService = (categoryId: ID) => {
    const svc: ServiceItem = { id: uid('svc'), name: 'New service', baseEndpoint: '/api/new' };
    setCategories(prev =>
      prev.map(c => (c.id === categoryId ? { ...c, services: [...c.services, svc] } : c))
    );
  };

  const runWorkflow = async (workflowId?: ID) => {
    if (!workflowId) return;
    try {
      const res = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        // Throw so the calling ServiceActionButton receives a rejection and shows error
        throw new Error('Execution failed');
      }
    } catch (e) {
      // bubble up error to ActionButton
      throw e;
    }
  };

  const rendered = useMemo(() => {
    if (loading) return <div className='text-sm text-muted-foreground'>Loading categories…</div>;
    if (categories.length === 0)
      return (
        <div className='text-sm text-muted-foreground'>
          No categories yet — create one to get started.
        </div>
      );

    return (
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {categories.map(cat => (
          <div
            key={cat.id}
            className='rounded-xl border border-border p-4 bg-surface-container-low'
          >
            {editingId === cat.id ? (
              <div className='space-y-2'>
                <Input value={newName} onChange={e => setNewName(e.target.value)} label='Name' />
                <Input
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  label='Description'
                />
                <div className='flex gap-2'>
                  <Button variant='outlined' onClick={() => saveEdit(cat.id)}>
                    Save
                  </Button>
                  <Button variant='text' onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h4 className='text-sm font-semibold'>{cat.name}</h4>
                    {cat.description && (
                      <p className='mt-1 text-xs text-muted-foreground'>{cat.description}</p>
                    )}
                    <div className='mt-3 flex flex-wrap gap-2'>
                      <span className='text-xs text-muted-foreground'>
                        {cat.services.length} services
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {cat.workflows.length} workflows
                      </span>
                    </div>
                  </div>

                  <div className='flex shrink-0 flex-col items-end gap-2'>
                    <div className='flex gap-2'>
                      <Button variant='outlined' onClick={() => startEdit(cat.id)}>
                        Edit
                      </Button>
                      <Button variant='text' onClick={() => deleteCategory(cat.id)}>
                        Delete
                      </Button>
                    </div>
                    <div>
                      <Button size='sm' variant='elevated' onClick={() => attachService(cat.id)}>
                        Attach Service
                      </Button>
                    </div>
                  </div>
                </div>

                <div className='mt-3 flex flex-wrap gap-2'>
                  {cat.tags?.map(t => (
                    <span key={t} className='rounded-full bg-primary/8 px-2 py-1 text-xs'>
                      {t}
                    </span>
                  ))}
                </div>

                {cat.workflows.length > 0 && (
                  <div className='mt-3 grid gap-2'>
                    {cat.workflows.map(w => (
                      <div
                        key={w.id}
                        className='flex items-center justify-between gap-3 rounded-md border border-border p-2'
                      >
                        <div className='text-sm'>{w.name}</div>
                        <div className='flex items-center gap-2'>
                          <ServiceActionButton
                            label='Run'
                            description={undefined}
                            onAction={() => runWorkflow(w.id)}
                            icon={<span className='text-xs'>▶</span>}
                            variant='primary'
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  }, [categories, editingId, loading, newDescription, newName]);

  return (
    <Card variant='elevated' padding='md'>
      <CardHeader>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription className='mt-1 text-sm text-muted-foreground'>
              Manage DeepSeek categories, attach services, and run workflows.
            </CardDescription>
          </div>

          <div className='flex items-center gap-2'>
            {!createMode ? (
              <Button onClick={startCreate} variant='filled'>
                Create category
              </Button>
            ) : (
              <div className='flex items-center gap-2'>
                <Input value={newName} onChange={e => setNewName(e.target.value)} label='Name' />
                <Button onClick={saveNew} variant='filled'>
                  Save
                </Button>
                <Button onClick={cancelCreate} variant='text'>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ServiceActionBar
          title='Category Actions'
          description='Quick actions for selected category'
          trailing={undefined}
        >
          {/* render the grid */}
          {rendered}
        </ServiceActionBar>
      </CardContent>

      <CardFooter>
        <div className='flex w-full items-center justify-end gap-2'>
          <Button variant='text'>Import</Button>
          <Button variant='outlined'>Export</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeepSeekCategoryCrud;

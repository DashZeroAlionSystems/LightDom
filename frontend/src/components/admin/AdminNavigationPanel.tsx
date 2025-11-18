import React from 'react';
import { cn } from '@/lib/utils';
import type { AdminNavigationCategory } from '@/services/adminNavigation';
import type { AdminNavigationStatus } from '@/hooks/useAdminNavigation';
import { Badge, Button, Card } from '@/components/ui';
import { CheckCircle2, CloudOff, Loader2, Shield } from 'lucide-react';

export interface AdminNavigationPanelProps {
  categories: AdminNavigationCategory[];
  status: AdminNavigationStatus;
  templateCount: number;
  selectedCategoryId?: string | null;
  selectedTemplateId?: string | null;
  onSelectTemplate?: (categoryId: string, templateId: string) => void;
  onRefresh?: () => void;
}

function renderStatusLabel(status: AdminNavigationStatus, templateCount: number) {
  switch (status) {
    case 'loading':
      return (
        <Badge variant='warning' className='gap-2'>
          <Loader2 className='h-3 w-3 animate-spin' /> Loading templates...
        </Badge>
      );
    case 'error':
      return (
        <Badge variant='error' className='gap-2'>
          <Shield className='h-3 w-3' /> Needs attention
        </Badge>
      );
    case 'ready':
      return (
        <Badge variant='success' className='gap-2'>
          <CheckCircle2 className='h-3 w-3' /> {templateCount} templates synced
        </Badge>
      );
    case 'fallback':
      return (
        <Badge variant='warning' className='gap-2'>
          <CloudOff className='h-3 w-3' /> Fallback templates active
        </Badge>
      );
    default:
      return (
        <Badge variant='secondary'>Watcher idle</Badge>
      );
  }
}

export const AdminNavigationPanel: React.FC<AdminNavigationPanelProps> = ({
  categories,
  status,
  templateCount,
  selectedCategoryId,
  selectedTemplateId,
  onSelectTemplate,
  onRefresh,
}) => {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2 rounded-2xl border border-outline/15 bg-surface-container-low px-3 py-2'>
        <div className='flex flex-col gap-0'>
          <span className='md3-title-small text-on-surface'>Workflow templates</span>
          <span className='md3-body-small text-on-surface-variant'>Sourced from n8n and schema directories</span>
        </div>
        <div className='flex items-center gap-2'>
          {renderStatusLabel(status, templateCount)}
          {onRefresh && (
            <Button variant='text' size='sm' onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </div>
      </div>

      {categories.length === 0 && status === 'ready' ? (
        <Card variant='outlined' className='p-4 text-sm text-on-surface-variant'>
          No templates have been discovered yet. Add files to <code>n8n/templates</code> or <code>schemas/workflow-templates</code> to populate the admin navigation automatically.
        </Card>
      ) : null}

      <div className='space-y-3'>
        {categories.map((category) => {
          return (
            <Card key={category.category_id} variant='filled' padding='md' className='space-y-3 border border-outline/15 bg-surface'>
              <div className='flex items-center justify-between gap-2'>
                <div>
                  <p className='md3-title-small text-on-surface'>{category.category}</p>
                  {category.subcategory && (
                    <p className='md3-body-small text-on-surface-variant'>
                      {category.subcategory}
                    </p>
                  )}
                </div>
                {category.icon && (
                  <span className='text-xl'>{category.icon}</span>
                )}
              </div>

              <div className='space-y-2'>
                {category.templates.map((template) => (
                  <button
                    key={template.template_id}
                    type='button'
                    className={cn(
                      'w-full rounded-2xl border px-3 py-2 text-left transition-all',
                      selectedCategoryId === category.category_id &&
                        selectedTemplateId === template.template_id
                        ? 'border-primary bg-primary/10 text-on-surface'
                        : 'border-outline/15 bg-surface-container-low hover:border-outline/30'
                    )}
                    onClick={() => onSelectTemplate?.(category.category_id, template.template_id)}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div className='min-w-0'>
                        <p className='md3-body-medium text-on-surface truncate'>{template.name}</p>
                        {template.description && (
                          <p className='md3-body-small text-on-surface-variant truncate'>
                            {template.description}
                          </p>
                        )}
                      </div>
                      {template.status_steps?.length ? (
                        <Badge variant='outline'>{template.status_steps.length} steps</Badge>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminNavigationPanel;

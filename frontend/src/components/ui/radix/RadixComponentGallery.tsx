import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import type { RadixComponentDescriptor } from './types';

export interface RadixComponentGalleryProps {
  components: RadixComponentDescriptor[];
  highlightTags?: string[];
  onComponentSelect?: (component: RadixComponentDescriptor) => void;
}

const CATEGORY_ORDER = [
  'Disclosure',
  'Input',
  'Navigation',
  'Overlay',
  'Feedback',
  'Data Display',
  'Layout',
  'Media',
  'Actions',
  'Forms',
  'Cards',
];

function formatTimestamp(timestamp: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(timestamp));
  } catch (error) {
    return timestamp;
  }
}

export const RadixComponentGallery: React.FC<RadixComponentGalleryProps> = ({
  components,
  highlightTags = [],
  onComponentSelect,
}) => {
  const [search, setSearch] = useState('');
  const normalizedHighlights = useMemo(
    () => highlightTags.map(tag => tag.toLowerCase()),
    [highlightTags]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const grouped = new Map<string, RadixComponentDescriptor[]>();

    components
      .filter(component => {
        if (!query) return true;
        return (
          component.name.toLowerCase().includes(query) ||
          component.slug.toLowerCase().includes(query) ||
          component.tags.some(tag => tag.toLowerCase().includes(query)) ||
          component.category.toLowerCase().includes(query)
        );
      })
      .forEach(component => {
        const key = component.category || 'Uncategorized';
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(component);
      });

    const orderedCategories = Array.from(grouped.keys()).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return orderedCategories.map(category => ({
      category,
      items: grouped.get(category)!.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [components, search]);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-on-surface'>Radix UI Atoms</h2>
          <p className='text-sm text-on-surface/70'>
            {components.length} components synced via the styleguide crawler campaign.
          </p>
        </div>
        <div className='flex w-full max-w-md items-center gap-3'>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder='Search components, tags, or packages'
            className='w-full rounded-lg border border-outline bg-surface-light/5 px-4 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          />
          <span className='hidden text-xs text-on-surface/60 sm:block'>
            {search
              ? `${filtered.reduce((sum, group) => sum + group.items.length, 0)} results`
              : 'Type to filter'}
          </span>
        </div>
      </div>

      <div className='space-y-8'>
        {filtered.map(group => (
          <section key={group.category} className='space-y-4'>
            <header className='flex items-center justify-between'>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-on-surface/70'>
                {group.category}
              </h3>
              <span className='text-xs text-on-surface/50'>{group.items.length} components</span>
            </header>

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {group.items.map(component => {
                const isHighlighted = component.tags.some(tag =>
                  normalizedHighlights.includes(tag.toLowerCase())
                );

                return (
                  <button
                    key={component.slug}
                    type='button'
                    onClick={() => onComponentSelect?.(component)}
                    className={cn(
                      'group flex h-full flex-col rounded-xl border border-outline bg-surface-light/5 p-4 text-left transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      component.status !== 'seeded' && 'border-dashed border-warning/60',
                      isHighlighted && 'border-primary shadow-lg'
                    )}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-sm font-medium text-on-surface'>{component.name}</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium uppercase',
                          component.status === 'seeded' && 'bg-success/10 text-success',
                          component.status === 'pending' && 'bg-warning/10 text-warning',
                          component.status === 'deprecated' && 'bg-error/10 text-error'
                        )}
                      >
                        {component.status}
                      </span>
                    </div>

                    <p className='mt-2 line-clamp-2 text-xs text-on-surface/60'>
                      {component.category} · {component.radixPackage}
                    </p>

                    <div className='mt-3 flex flex-wrap gap-1'>
                      {component.tags.map(tag => (
                        <span
                          key={tag}
                          className={cn(
                            'rounded-full bg-surface-dark/40 px-2 py-0.5 text-[11px] uppercase tracking-wide text-on-surface/60',
                            normalizedHighlights.includes(tag.toLowerCase()) &&
                              'bg-primary/10 text-primary'
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className='mt-4 flex flex-col gap-1 text-xs text-on-surface/50'>
                      <a
                        href={component.docUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='truncate text-primary transition-colors hover:text-primary/80'
                      >
                        {component.docUrl}
                      </a>
                      <span>Updated {formatTimestamp(component.lastUpdated)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className='rounded-xl border border-outline bg-surface-light/10 p-8 text-center text-sm text-on-surface/70'>
            No components match that filter yet. Try a different keyword or tag.
          </div>
        )}
      </div>
    </div>
  );
};

export default RadixComponentGallery;

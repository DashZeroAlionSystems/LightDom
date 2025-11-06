import React from 'react';
import { Modal, Button, Card } from '@/components/ui';

export interface AnnouncementItem {
  id: string;
  title: string;
  description?: string;
}

export interface AnnounceModalConfig {
  title?: string;
  items?: AnnouncementItem[];
  right?: {
    heading?: string;
    body?: string;
    image?: string;
    primaryAction?: { label: string };
    secondaryAction?: { label: string };
  };
}

export const AnnounceModal: React.FC<{
  open: boolean;
  onClose: () => void;
  config?: AnnounceModalConfig;
}> = ({ open, onClose, config }) => {
  const cfg = {
    title: "Explore what's new",
    items: [
      { id: '1', title: 'Copilot CLI updates', description: 'Install and manage custom agents from the CLI.' },
      { id: '2', title: 'Manage agents and their sessions' },
      { id: '3', title: 'Copilot Code review updates' },
    ],
    right: {
      heading: 'Fresh updates for Copilot CLI',
      body: 'Discover custom agents, a new command to push your sessions to coding agent, and more.',
      image: '',
      primaryAction: { label: 'Install now' },
      secondaryAction: { label: 'Learn more' },
    },
    ...(config || {}),
  } as AnnounceModalConfig;

  return (
    <Modal isOpen={open} onClose={onClose} title={cfg.title}>
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="space-y-3 border-r pr-4">
          {cfg.items?.map((it) => (
            <button key={it.id} className="w-full text-left p-2 rounded hover:bg-surface">
              <div className="font-medium">{it.title}</div>
              {it.description && <div className="text-xs text-muted-foreground">{it.description}</div>}
            </button>
          ))}
        </div>
        <div>
          <Card className="p-4">
            <h3 className="text-lg font-semibold">{cfg.right?.heading}</h3>
            <p className="text-sm text-muted-foreground my-3">{cfg.right?.body}</p>
            <div className="flex gap-3">
              <Button>{cfg.right?.primaryAction?.label || 'OK'}</Button>
              <Button variant="text">{cfg.right?.secondaryAction?.label || 'Learn more'}</Button>
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default AnnounceModal;

import React from 'react';
import { MessageCircle, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContainer';

interface SidebarChatItemProps {
  id: string;
  title: string;
  timestamp?: Date;
  isActive?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const SidebarChatItem: React.FC<SidebarChatItemProps> = ({
  title,
  timestamp,
  isActive = false,
  onClick,
  onEdit,
  onDelete,
  className,
}) => {
  const { collapsed } = useSidebar();
  const [showActions, setShowActions] = React.useState(false);

  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center justify-center p-3 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          className
        )}
        title={title}
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-foreground hover:bg-accent',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
    >
      <MessageCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{title}</p>
        {timestamp && (
          <p className="text-xs text-muted-foreground">
            {timestamp.toLocaleDateString()}
          </p>
        )}
      </div>
      
      {showActions && (onEdit || onDelete) && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Edit chat"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Delete chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Mail, Phone, MapPin, Calendar, Edit2, MoreVertical } from 'lucide-react';
import { Avatar } from '../../atoms/Avatar';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { Card } from '../../atoms/Card';
import { Divider } from '../../atoms/Divider';
import { DropdownMenu } from '../../molecules/DropdownMenu';

export interface UserProfileProps {
  user: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    joinedDate?: string;
    avatar?: string;
    role?: string;
    status?: 'active' | 'inactive' | 'pending';
    bio?: string;
    stats?: {
      label: string;
      value: number | string;
    }[];
  };
  onEdit?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
  onViewProfile?: () => void;
  onDelete?: () => void;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }[];
  variant?: 'default' | 'compact';
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  onMessage,
  onCall,
  onViewProfile,
  onDelete,
  actions = [],
  variant = 'default',
  className = '',
}) => {
  const statusColors = {
    active: 'success' as const,
    inactive: 'secondary' as const,
    pending: 'warning' as const,
  };

  const menuItems = [
    ...(onViewProfile ? [{ label: 'View Full Profile', onClick: onViewProfile }] : []),
    ...(onEdit ? [{ icon: <Edit2 size={16} />, label: 'Edit Profile', onClick: onEdit }] : []),
    ...actions.map((action) => ({
      icon: action.icon,
      label: action.label,
      onClick: action.onClick,
      destructive: action.destructive,
    })),
    ...(onDelete ? [{ separator: true as const }, { label: 'Delete', onClick: onDelete, destructive: true }] : []),
  ];

  if (variant === 'compact') {
    return (
      <Card variant="outlined" className={`p-4 ${className}`}>
        <div className="flex items-center gap-4">
          <Avatar
            src={user.avatar}
            alt={user.name}
            initials={user.name.split(' ').map(n => n[0]).join('')}
            size="lg"
            status={user.status}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
              {user.role && (
                <Badge variant={statusColors[user.status || 'active']} size="sm">
                  {user.role}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
          {menuItems.length > 0 && (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm">
                  <MoreVertical size={18} />
                </Button>
              }
              items={menuItems}
            />
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="outlined" className={className}>
      <Card.Header>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatar}
              alt={user.name}
              initials={user.name.split(' ').map(n => n[0]).join('')}
              size="xl"
              status={user.status}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              {user.role && (
                <Badge variant={statusColors[user.status || 'active']} className="mt-1">
                  {user.role}
                </Badge>
              )}
            </div>
          </div>
          {menuItems.length > 0 && (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm">
                  <MoreVertical size={18} />
                </Button>
              }
              items={menuItems}
            />
          )}
        </div>
      </Card.Header>

      <Divider />

      <Card.Content>
        {/* Bio */}
        {user.bio && (
          <div className="mb-4">
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail size={18} />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} />
              <span>{user.phone}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin size={18} />
              <span>{user.location}</span>
            </div>
          )}
          {user.joinedDate && (
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} />
              <span>Joined {user.joinedDate}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {user.stats && user.stats.length > 0 && (
          <>
            <Divider />
            <div className="grid grid-cols-3 gap-4 mt-6">
              {user.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card.Content>

      {/* Actions */}
      {(onMessage || onCall || onEdit) && (
        <>
          <Divider />
          <Card.Footer>
            <div className="flex items-center gap-2">
              {onMessage && (
                <Button variant="default" className="flex-1" onClick={onMessage}>
                  Message
                </Button>
              )}
              {onCall && (
                <Button variant="outline" className="flex-1" onClick={onCall}>
                  Call
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit2 size={16} />
                </Button>
              )}
            </div>
          </Card.Footer>
        </>
      )}
    </Card>
  );
};

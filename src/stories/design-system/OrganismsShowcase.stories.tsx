import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  Header, 
  Sidebar, 
  DataTable, 
  Form, 
  UserProfile, 
  NotificationCenter 
} from '../../components/organisms';
import { Badge } from '../../components/atoms';

const meta: Meta = {
  title: 'Design System/Organisms Showcase',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Header Story
export const HeaderDemo: StoryObj = {
  render: () => {
    const [notifications, setNotifications] = useState(5);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          appName="LightDom Platform"
          notifications={notifications}
          user={{
            name: 'John Doe',
            email: 'john@example.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          }}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => {
            console.log('Notifications clicked');
            setNotifications(0);
          }}
          onProfileClick={() => console.log('Profile clicked')}
          onSettingsClick={() => console.log('Settings clicked')}
          onLogoutClick={() => console.log('Logout clicked')}
          onMenuClick={() => console.log('Menu clicked')}
        />
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Header Component</h2>
          <p className="text-gray-600">
            A responsive application header with search, notifications, and user menu.
          </p>
        </div>
      </div>
    );
  },
};

// Sidebar Story
export const SidebarDemo: StoryObj = {
  render: () => {
    const [activeItem, setActiveItem] = useState('home');

    const sections = [
      {
        title: 'Main',
        items: [
          { id: 'home', label: 'Home', icon: '🏠', active: activeItem === 'home' },
          { id: 'dashboard', label: 'Dashboard', icon: '📊', active: activeItem === 'dashboard' },
          { id: 'documents', label: 'Documents', icon: '📄', badge: 3, active: activeItem === 'documents' },
        ],
      },
      {
        title: 'Management',
        items: [
          { id: 'users', label: 'Users', icon: '👥', active: activeItem === 'users' },
          { id: 'analytics', label: 'Analytics', icon: '📈', active: activeItem === 'analytics' },
        ],
      },
    ];

    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          sections={sections}
          activeItemId={activeItem}
          onItemClick={setActiveItem}
        />
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sidebar Navigation</h2>
          <p className="text-gray-600">
            Active section: <Badge variant="default">{activeItem}</Badge>
          </p>
        </div>
      </div>
    );
  },
};

// DataTable Story
export const DataTableDemo: StoryObj = {
  render: () => {
    const data = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
      { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' },
      { id: 6, name: 'Diana Davis', email: 'diana@example.com', role: 'Admin', status: 'Active' },
      { id: 7, name: 'Eve Martinez', email: 'eve@example.com', role: 'User', status: 'Inactive' },
      { id: 8, name: 'Frank Taylor', email: 'frank@example.com', role: 'Editor', status: 'Active' },
      { id: 9, name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'Active' },
      { id: 10, name: 'Henry Clark', email: 'henry@example.com', role: 'User', status: 'Active' },
      { id: 11, name: 'Ivy Walker', email: 'ivy@example.com', role: 'Admin', status: 'Active' },
      { id: 12, name: 'Jack White', email: 'jack@example.com', role: 'User', status: 'Inactive' },
    ];

    const columns = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      { 
        key: 'role', 
        header: 'Role', 
        sortable: true,
        render: (value: string) => (
          <Badge variant={value === 'Admin' ? 'default' : 'secondary'}>
            {value}
          </Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (value: string) => (
          <Badge variant={value === 'Active' ? 'success' : 'secondary'}>
            {value}
          </Badge>
        ),
      },
    ];

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Table</h2>
        <DataTable
          data={data}
          columns={columns}
          selectable
          sortable
          filterable
          pagination
          pageSize={5}
          onRowSelect={(rows) => console.log('Selected rows:', rows)}
          onRowClick={(row) => console.log('Clicked row:', row)}
        />
      </div>
    );
  },
};

// Form Story
export const FormDemo: StoryObj = {
  render: () => {
    const fields = [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text' as const,
        placeholder: 'Enter your full name',
        required: true,
        validation: (value: string) => {
          if (value.length < 2) return 'Name must be at least 2 characters';
          return undefined;
        },
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'Enter your email',
        required: true,
        validation: (value: string) => {
          if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email address';
          return undefined;
        },
      },
      {
        name: 'role',
        label: 'Role',
        type: 'select' as const,
        required: true,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Editor', value: 'editor' },
          { label: 'User', value: 'user' },
        ],
      },
      {
        name: 'bio',
        label: 'Bio',
        type: 'textarea' as const,
        placeholder: 'Tell us about yourself',
        description: 'A brief description of your background',
      },
      {
        name: 'newsletter',
        label: 'Subscribe to newsletter',
        type: 'checkbox' as const,
        defaultValue: true,
      },
    ];

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Form
            title="User Registration"
            description="Fill out the form below to create your account"
            fields={fields}
            onSubmit={(data) => {
              console.log('Form submitted:', data);
              return new Promise((resolve) => setTimeout(resolve, 1000));
            }}
            submitLabel="Create Account"
            onCancel={() => console.log('Form cancelled')}
            variant="card"
          />
        </div>
      </div>
    );
  },
};

// UserProfile Story
export const UserProfileDemo: StoryObj = {
  render: () => {
    const user = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      location: 'San Francisco, CA',
      joinedDate: 'January 2024',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      role: 'Senior Developer',
      status: 'active' as const,
      bio: 'Passionate developer with 10+ years of experience in building web applications. Love working with React, TypeScript, and modern web technologies.',
      stats: [
        { label: 'Projects', value: 24 },
        { label: 'Followers', value: '1.2K' },
        { label: 'Following', value: 342 },
      ],
    };

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Full Profile */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Full Profile</h3>
            <UserProfile
              user={user}
              onEdit={() => console.log('Edit profile')}
              onMessage={() => console.log('Send message')}
              onCall={() => console.log('Call user')}
              onDelete={() => console.log('Delete user')}
            />
          </div>

          {/* Compact Profile */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Compact Profile</h3>
            <div className="space-y-4">
              <UserProfile
                user={user}
                variant="compact"
                onEdit={() => console.log('Edit profile')}
              />
              <UserProfile
                user={{ ...user, status: 'inactive' }}
                variant="compact"
              />
              <UserProfile
                user={{ ...user, status: 'pending', role: 'New User' }}
                variant="compact"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// NotificationCenter Story
export const NotificationCenterDemo: StoryObj = {
  render: () => {
    const [notifications, setNotifications] = useState([
      {
        id: '1',
        title: 'New message from Alice',
        message: 'Hey! How are you doing? I wanted to check in on the project progress.',
        timestamp: '2 minutes ago',
        read: false,
        type: 'info' as const,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      },
      {
        id: '2',
        title: 'Task completed',
        message: 'Your deployment to production was successful.',
        timestamp: '1 hour ago',
        read: false,
        type: 'success' as const,
      },
      {
        id: '3',
        title: 'Warning: High CPU usage',
        message: 'Server load is above 80%. Consider scaling your application.',
        timestamp: '3 hours ago',
        read: true,
        type: 'warning' as const,
        action: {
          label: 'View details',
          onClick: () => console.log('View details'),
        },
      },
      {
        id: '4',
        title: 'Build failed',
        message: 'The CI/CD pipeline failed. Check the logs for more details.',
        timestamp: '5 hours ago',
        read: true,
        type: 'error' as const,
      },
      {
        id: '5',
        title: 'New comment on your post',
        message: 'Bob commented: "Great work on this feature!"',
        timestamp: '1 day ago',
        read: true,
        type: 'info' as const,
      },
    ]);

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Center</h2>
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              );
            }}
            onMarkAllAsRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }}
            onDelete={(id) => {
              setNotifications((prev) => prev.filter((n) => n.id !== id));
            }}
            onDeleteAll={() => {
              setNotifications([]);
            }}
            onNotificationClick={(notification) => {
              console.log('Notification clicked:', notification);
            }}
          />
        </div>
      </div>
    );
  },
};

// All Organisms in One View
export const AllOrganisms: StoryObj = {
  render: () => {
    return (
      <div className="space-y-12 p-6 bg-gray-50 min-h-screen">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Organism Components</h2>
          <p className="text-gray-600 mb-8">
            Complex composed sections combining atoms and molecules into functional page sections.
          </p>
        </div>

        {/* Component Grid */}
        <div className="grid gap-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-2">Header</h3>
            <p className="text-gray-600 mb-4">Application header with search, notifications, and user menu</p>
            <div className="text-sm text-gray-500">
              Features: Logo, Search, Notifications, User dropdown, Responsive
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-2">Sidebar</h3>
            <p className="text-gray-600 mb-4">Collapsible navigation sidebar with sections and badges</p>
            <div className="text-sm text-gray-500">
              Features: Collapsible, Sections, Active states, Badges, Icons
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-2">DataTable</h3>
            <p className="text-gray-600 mb-4">Advanced table with sorting, filtering, and pagination</p>
            <div className="text-sm text-gray-500">
              Features: Sortable columns, Search, Row selection, Pagination, Custom renderers
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-2">Form</h3>
            <p className="text-gray-600 mb-4">Complete form with validation and error handling</p>
            <div className="text-sm text-gray-500">
              Features: Multiple field types, Validation, Error display, Loading states
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-2">UserProfile</h3>
            <p className="text-gray-600 mb-4">User profile card with contact info and actions</p>
            <div className="text-sm text-gray-500">
              Features: Avatar, Contact details, Stats, Actions, Compact variant
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-2">NotificationCenter</h3>
            <p className="text-gray-600 mb-4">Notification list with filtering and actions</p>
            <div className="text-sm text-gray-500">
              Features: Tabs, Mark as read, Delete, Type indicators, Actions
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Design System Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-900">
            <div>
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm">Atom Components</div>
            </div>
            <div>
              <div className="text-3xl font-bold">13</div>
              <div className="text-sm">Molecule Components</div>
            </div>
            <div>
              <div className="text-3xl font-bold">6</div>
              <div className="text-sm">Organism Components</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

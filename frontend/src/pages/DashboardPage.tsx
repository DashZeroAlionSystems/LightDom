import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Workflow, Brain, Settings } from 'lucide-react';

interface NavItem {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Overview',
    description: 'High-level metrics and activity',
    to: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Automation',
    description: 'Workflow orchestration and queues',
    to: '/workflows',
    icon: <Workflow className="h-4 w-4" />,
  },
  {
    label: 'Neural Ops',
    description: 'Neural network telemetry and training',
    to: '/complete-dashboard',
    icon: <Brain className="h-4 w-4" />,
  },
  {
    label: 'Layout settings',
    description: 'Customize dashboard surfaces',
    to: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

const DashboardSideNav: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-72 flex flex-col gap-6 border-r border-outline bg-surface p-6">
      <div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-exodus text-white font-semibold md3-title-small">
          LD
        </div>
        <h2 className="md3-title-medium text-on-surface mt-3">Dashboard navigation</h2>
        <p className="md3-label-medium text-on-surface-variant">
          Quick access to dashboard surfaces.
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex flex-col gap-1 rounded-2xl border transition-colors p-4 ${
                isActive
                  ? 'border-primary bg-primary-container text-on-primary-container'
                  : 'border-outline/40 bg-surface-variant/30 text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? 'bg-primary/20 text-on-primary-container' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="md3-title-small font-medium">{item.label}</span>
              </div>
              <span
                className={`md3-body-small transition-colors ${
                  isActive ? 'text-on-primary-container/90' : 'text-on-surface-variant'
                }`}
              >
                {item.description}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-outline bg-surface-variant/40 p-4">
        <p className="md3-label-medium text-on-surface-variant">
          Customize the content surface in the panel on the right.
        </p>
      </div>
    </aside>
  );
};

const DashboardContentArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <section className="flex-1 overflow-y-auto bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-8">
        {children}
      </div>
    </section>
  );
};

export const DashboardPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-background text-on-surface flex">
      <DashboardSideNav />
      <DashboardContentArea>
        <header className="flex flex-col gap-2">
          <p className="md3-label-medium text-primary uppercase tracking-wide">Dashboard layout</p>
          <h1 className="md3-headline-medium">Automation control center</h1>
          <p className="md3-body-medium text-on-surface-variant">
            Use the side navigation to move between surfaces. Fill the content canvas with widgets, workflow panels,
            or KPI grids that follow the design guide spacing and elevation.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-outline bg-surface p-6 space-y-4">
            <h2 className="md3-title-medium text-on-surface">Content area</h2>
            <p className="md3-body-medium text-on-surface-variant">
              Slot dashboard widgets, KPIs, or workflow panels here. The container keeps spacing and max-width aligned
              with the Material Design 3 layout guidance.
            </p>
          </div>
          <div className="rounded-3xl border border-outline bg-surface p-6 space-y-4">
            <h2 className="md3-title-medium text-on-surface">Interaction notes</h2>
            <ul className="space-y-2 md3-body-medium text-on-surface-variant">
              <li>• Navigation sections highlight based on the current route for clarity.</li>
              <li>• Content canvas stays scrollable independently from the side navigation.</li>
              <li>• Replace these cards with design-system components as your dashboard evolves.</li>
            </ul>
          </div>
        </div>
      </DashboardContentArea>
    </main>
  );
};

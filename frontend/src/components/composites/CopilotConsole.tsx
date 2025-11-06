import React from 'react';
import { Card, Input, Button, Avatar, Badge } from '@/components/ui';
import { Send, Clock, GitBranch } from 'lucide-react';

export interface CopilotSession {
  id: string;
  title: string;
  repo?: string;
  timestamp?: string;
}

export interface CopilotConsoleConfig {
  placeholder?: string;
  hero?: {
    title?: string;
    subtitle?: string;
    showBanner?: boolean;
  };
  recentSessions?: CopilotSession[];
}

const defaultConfig: CopilotConsoleConfig = {
  placeholder: "Describe a task, try '/task' or ask for help...",
  hero: { title: "LightDom Copilot", subtitle: 'Start a new task or resume a session', showBanner: true },
  recentSessions: [],
};

export const CopilotConsole: React.FC<{ config?: CopilotConsoleConfig }> = ({ config }) => {
  const cfg = { ...defaultConfig, ...(config || {}) };

  return (
    <Card className="p-4 space-y-4">
      {cfg.hero?.showBanner && (
        <div className="rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white">
          <h3 className="font-semibold text-lg">{cfg.hero?.title}</h3>
          <p className="text-sm text-slate-200">{cfg.hero?.subtitle}</p>
        </div>
      )}

      <div className="flex items-start gap-4">
        <Avatar />
        <div className="flex-1">
          <Input placeholder={cfg.placeholder} className="mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" /> <span>Type /task to start a new job</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="text" size="sm">
                <GitBranch className="w-4 h-4" />
              </Button>
              <Button size="sm">
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Recent agent sessions</h4>
        <div className="grid gap-2">
          {(cfg.recentSessions?.length || 0) === 0 && (
            <div className="text-sm text-muted-foreground">No recent sessions. Start a new one above.</div>
          )}
          {cfg.recentSessions?.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md p-2 bg-surface">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Agent</Badge>
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.repo || 'Unknown repo'}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{s.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CopilotConsole;

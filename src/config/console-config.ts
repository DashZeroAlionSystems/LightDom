/**
 * Console Configuration System
 * Provides rich, configurable console output for service orchestration
 */

import chalk from 'chalk';

export interface ConsoleTheme {
  primary: (text: string) => string;
  secondary: (text: string) => string;
  success: (text: string) => string;
  warning: (text: string) => string;
  error: (text: string) => string;
  info: (text: string) => string;
  highlight: (text: string) => string;
  dim: (text: string) => string;
}

export interface ConsoleConfig {
  theme: ConsoleTheme;
  enableTimestamps: boolean;
  enableServiceLabels: boolean;
  enableColors: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLineLength: number;
  enableBorders: boolean;
  enableIcons: boolean;
}

export const defaultTheme: ConsoleTheme = {
  primary: chalk.cyan,
  secondary: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.white,
  highlight: chalk.magenta,
  dim: chalk.gray,
};

export const defaultConsoleConfig: ConsoleConfig = {
  theme: defaultTheme,
  enableTimestamps: true,
  enableServiceLabels: true,
  enableColors: true,
  logLevel: 'info',
  maxLineLength: 120,
  enableBorders: true,
  enableIcons: true,
};

export const consoleIcons = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  service: '⚙',
  deepseek: '🤖',
  instance: '📦',
  api: '🔌',
  schema: '📋',
  snippet: '✨',
  dom: '🌐',
  analytics: '📊',
  worker: '⚡',
  chrome: '🌐',
  bundle: '📦',
  stream: '📡',
  monitor: '👁',
};

export class ConsoleFormatter {
  private config: ConsoleConfig;

  constructor(config: Partial<ConsoleConfig> = {}) {
    this.config = { ...defaultConsoleConfig, ...config };
  }

  private getTimestamp(): string {
    if (!this.config.enableTimestamps) return '';
    const now = new Date();
    return this.config.theme.dim(
      `[${now.toLocaleTimeString('en-US', { hour12: false })}]`
    );
  }

  private getServiceLabel(service: string): string {
    if (!this.config.enableServiceLabels) return '';
    return this.config.theme.secondary(`[${service}]`);
  }

  private getIcon(type: keyof typeof consoleIcons): string {
    if (!this.config.enableIcons) return '';
    return consoleIcons[type] + ' ';
  }

  private wrapText(text: string): string {
    if (text.length <= this.config.maxLineLength) return text;
    const wrapped: string[] = [];
    let current = '';
    
    text.split(' ').forEach(word => {
      if ((current + word).length > this.config.maxLineLength) {
        wrapped.push(current.trim());
        current = '  ' + word + ' ';
      } else {
        current += word + ' ';
      }
    });
    
    if (current) wrapped.push(current.trim());
    return wrapped.join('\n');
  }

  private createBorder(width: number, style: 'top' | 'middle' | 'bottom'): string {
    if (!this.config.enableBorders) return '';
    
    const chars = {
      top: { left: '╭', right: '╮', fill: '─' },
      middle: { left: '├', right: '┤', fill: '─' },
      bottom: { left: '╰', right: '╯', fill: '─' },
    };
    
    const { left, right, fill } = chars[style];
    return this.config.theme.dim(`${left}${fill.repeat(width - 2)}${right}`);
  }

  public formatServiceMessage(
    service: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): string {
    const timestamp = this.getTimestamp();
    const label = this.getServiceLabel(service);
    const icon = this.getIcon(
      type === 'info' ? 'service' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'error'
    );
    
    const coloredMessage = this.config.theme[type](this.wrapText(message));
    return `${timestamp} ${label} ${icon}${coloredMessage}`;
  }

  public formatDataStream(
    service: string,
    data: any,
    streamType: keyof typeof consoleIcons = 'stream'
  ): string {
    const timestamp = this.getTimestamp();
    const label = this.getServiceLabel(service);
    const icon = this.getIcon(streamType);
    
    let formattedData: string;
    if (typeof data === 'object') {
      formattedData = JSON.stringify(data, null, 2)
        .split('\n')
        .map((line, idx) => (idx === 0 ? line : '  ' + line))
        .join('\n');
    } else {
      formattedData = String(data);
    }
    
    return `${timestamp} ${label} ${icon}${this.config.theme.info(formattedData)}`;
  }

  public formatServiceBundle(
    bundleName: string,
    services: Array<{ name: string; status: string; port?: number }>
  ): string {
    const timestamp = this.getTimestamp();
    const icon = this.getIcon('bundle');
    const header = `${timestamp} ${icon}${this.config.theme.highlight(bundleName)}`;
    
    const serviceLines = services.map(s => {
      const statusColor = s.status === 'running' ? this.config.theme.success : 
                         s.status === 'starting' ? this.config.theme.warning :
                         this.config.theme.error;
      const portInfo = s.port ? ` :${s.port}` : '';
      return `  ${this.getIcon('service')}${s.name}${portInfo} - ${statusColor(s.status)}`;
    });
    
    const width = Math.min(
      Math.max(...[header, ...serviceLines].map(l => l.length)),
      this.config.maxLineLength
    );
    
    return [
      this.createBorder(width, 'top'),
      header,
      this.createBorder(width, 'middle'),
      ...serviceLines,
      this.createBorder(width, 'bottom'),
    ].filter(Boolean).join('\n');
  }

  public formatProgress(
    service: string,
    message: string,
    progress: number,
    total: number
  ): string {
    const timestamp = this.getTimestamp();
    const label = this.getServiceLabel(service);
    const percentage = Math.round((progress / total) * 100);
    const barLength = 30;
    const filled = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    return `${timestamp} ${label} ${message} ${this.config.theme.primary(bar)} ${percentage}% (${progress}/${total})`;
  }

  public formatInstanceInfo(
    instanceId: string,
    type: string,
    status: string,
    details: any
  ): string {
    const timestamp = this.getTimestamp();
    const icon = this.getIcon('instance');
    const statusColor = status === 'active' ? this.config.theme.success : 
                       status === 'starting' ? this.config.theme.warning :
                       this.config.theme.error;
    
    const lines = [
      `${timestamp} ${icon}${this.config.theme.highlight(`Instance: ${instanceId}`)}`,
      `  Type: ${this.config.theme.info(type)}`,
      `  Status: ${statusColor(status)}`,
    ];
    
    if (details) {
      Object.entries(details).forEach(([key, value]) => {
        lines.push(`  ${key}: ${this.config.theme.dim(String(value))}`);
      });
    }
    
    return lines.join('\n');
  }

  public formatError(service: string, error: Error | string): string {
    const timestamp = this.getTimestamp();
    const label = this.getServiceLabel(service);
    const icon = this.getIcon('error');
    
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    
    const lines = [
      `${timestamp} ${label} ${icon}${this.config.theme.error(errorMessage)}`,
    ];
    
    if (stack) {
      lines.push(this.config.theme.dim(stack));
    }
    
    return lines.join('\n');
  }
}

export const consoleFormatter = new ConsoleFormatter();

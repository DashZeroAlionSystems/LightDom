// Browser-compatible logger (replaces winston for frontend)
export class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.service}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage('error', message, error));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  debug(message: string, meta?: any): void {
    console.debug(this.formatMessage('debug', message, meta));
  }
}
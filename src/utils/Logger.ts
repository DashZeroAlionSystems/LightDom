/**
 * Simple Logger utility for services
 */

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, ...args: any[]) {
    console.log(`[${this.context}] ${message}`, ...args);
  }

  info(message: string, ...args: any[]) {
    console.info(`[${this.context}] ℹ️ ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.context}] ⚠️ ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.context}] ❌ ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.context}] 🐛 ${message}`, ...args);
    }
  }
}

// Default logger instance for convenience
export const logger = new Logger('App');

// Default export of Logger class
export default Logger;


/**
 * Centralized logger utility for consistent logging across the application
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Simple logger implementation
export class Logger {
  private context: string;
  
  constructor(context: string) {
    this.context = context;
  }
  
  private formatMessage(level: LogLevel, message: string): string {
    return `[${new Date().toISOString()}] [${level}] [${this.context}] ${message}`;
  }
  
  debug(message: string, ...args: any[]): void {
    if (process.env.LOG_LEVEL === 'DEBUG') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message), ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage(LogLevel.INFO, message), ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
  }
  
  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(LogLevel.ERROR, message), ...args);
  }
}

// Create a logger factory
export function createLogger(context: string): Logger {
  return new Logger(context);
} 
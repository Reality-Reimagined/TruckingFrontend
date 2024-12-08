type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  static log(level: LogLevel, message: string, data?: any, error?: Error) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console[level](logEntry);
    }

    // Could add additional logging services here (e.g., Sentry, LogRocket)
    if (level === 'error' && process.env.SENTRY_DSN) {
      // Sentry.captureException(error);
    }

    return logEntry;
  }
} 
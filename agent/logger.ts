// logger.ts
import pino from 'pino';

// Configure Pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Set log level via environment variable or default to 'info'
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined, // Use prettyPrint in development for readability
  base: {
    pid: false, // Remove PID from logs
  },
  timestamp: pino.stdTimeFunctions.isoTime, // Use ISO timestamps
});

export default logger;
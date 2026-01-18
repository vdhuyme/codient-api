import { storage } from '@utils';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${typeof message === 'object' ? JSON.stringify(message) : message}`;
        }),
      ),
    }),

    new DailyRotateFile({
      filename: storage.storagePath('logs/error-%DATE%.json'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: false,
      maxFiles: '14d',
    }),

    new DailyRotateFile({
      filename: storage.storagePath('logs/combined-%DATE%.json'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '14d',
    }),
  ],
});

export { logger };

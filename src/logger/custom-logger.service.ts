import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
const Sentry = require('winston-transport-sentry-node').default;

dotenv.config();

const options = {
  sentry: {
    dsn: process.env.DSN,
    environment: process.env.ENVIRONMENT,
    maxValueLength: 1500,
  },
  level: `${process.env.LOG_LEVEL_SENTRY}`,
};

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  private logLevel = process.env.LOG_LEVEL || 'info';

  constructor() {
    super();
  }

  private logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.printf(
      (logInfo) =>
        `[${logInfo.timestamp}] ${logInfo.level.toUpperCase()}:
         [${this.context || 'SCA'}] ${logInfo.message}`,
    ),
  );

  private fileTransportConfig = new DailyRotateFile({
    level: this.logLevel,
    dirname: './/logs//',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD', // generates one log file by day
  });

  private consoleTransportConfig = new winston.transports.Console({
    level: this.logLevel,
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      this.logFormat,
    ),
  });

  private logger = winston.createLogger({
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    },
    format: this.logFormat,
    transports: [
      this.fileTransportConfig,
      this.consoleTransportConfig,
      new Sentry(options),
    ],
  });

  log(message: any) {
    this.logger.info('%o', message);
  }

  info(message: any) {
    this.logger.info('%o', message);
  }

  error(message: any) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    this.logger.error(message, { name: message.slice(0, 99) });
  }

  warn(message: any) {
    this.logger.warn('%o', message);
  }

  debug(message: any) {
    this.logger.debug('%o', message);
  }

  verbose(message: any) {
    this.logger.verbose('%o', message);
  }
}

import { LoggerService } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { createLogger, format, Logger, transports } from 'winston';

export class MyLogger implements LoggerService {
  private logger: Logger;
  constructor() {
    this.logger = createLogger({
      level: 'debug',
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ context, message, level }) => {
              const strApp = chalk.green(`[Nest]`);
              const strContext = chalk.yellow(`[${context}]`);
              const timestamp = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
              return `${strApp} - ${timestamp} ${level} ${strContext} ${message}`;
            }),
          ),
        }),
        new transports.File({
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.json(),
          ),
          dirname: 'logs',
          filename: 'dev.log',
        }),
      ],
    });
  }
  log(message: string, context: string): void {
    this.logger.info(message, { context });
  }
  error(message: string, context: string): void {
    this.logger.error(message, { context });
  }
  warn(message: string, context: string): void {
    this.logger.warn(message, { context });
  }
  debug(message: string, context: string): void {
    this.logger.debug(message, { context });
  }
  verbose(message: string, context: string): void {
    this.logger.verbose(message, { context });
  }
  fatal(message: string, context: string): void {
    this.logger.error(`FATAL: ${message}`, { context });
  }
}

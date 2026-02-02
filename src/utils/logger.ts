import pino from 'pino';

interface LoggerConfig {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
  format: 'json' | 'pretty' | 'compact';
  colors: boolean;
}

export class Logger {
  private logger: pino.Logger;

  constructor(config: LoggerConfig) {
    const transport = this.getTransport(config);
    this.logger = pino(
      {
        level: config.level,
        serializers: {
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
          err: pino.stdSerializers.err,
        },
      },
      transport
    );
  }

  private getTransport(config: LoggerConfig): any {
    if (config.format === 'pretty') {
      return pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: config.colors,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      });
    }
    return undefined;
  }

  trace(message: string, ...args: any[]): void {
    this.logger.trace({ args }, message);
  }

  debug(message: string, ...args: any[]): void {
    this.logger.debug({ args }, message);
  }

  info(message: string, ...args: any[]): void {
    this.logger.info({ args }, message);
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn({ args }, message);
  }

  error(message: string, error?: any): void {
    this.logger.error(error || {}, message);
  }

  fatal(message: string, error?: any): void {
    this.logger.fatal(error || {}, message);
  }
}

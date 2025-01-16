import { LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import winston, {
  createLogger,
  format,
  transports,
  LoggerOptions,
} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, prettyPrint, errors, colorize } =
  format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const infotransport = new DailyRotateFile({
  filename: 'info-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  dirname: `logs/`,
  level: 'info',
  handleExceptions: true,
  zippedArchive: true,
  maxSize: '20m',
  //maxFiles: '14d'
});

const errortransport = new DailyRotateFile({
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  dirname: `logs/`,
  level: 'error',
  handleExceptions: true,
  zippedArchive: true,
  maxSize: '20m',
  //maxFiles: '14d'
});

const customizedConfig = {
  levels: {
    error: 0,
    warn: 1,
    data: 2,
    info: 3,
    debug: 4,
    verbose: 5,
    silly: 6,
    http: 7,
  },
  colors: {
    error: 'red',
    warn: 'orange',
    data: 'grey',
    info: 'green',
    debug: 'yellow',
    verbose: 'cyan',
    silly: 'magenta',
    http: 'magenta',
  },
};

const customizedConfiglevelsKeyArray = Object.keys(customizedConfig.levels);

const winstonLogOptions = {
  levels: customizedConfig.levels,
  format: combine(
    label({ label: 'App' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(),
    format.simple(),
    myFormat,
  ),
  transports: [
    new transports.Console({
      level: `${customizedConfiglevelsKeyArray[customizedConfiglevelsKeyArray.length - 1]}`,
      format: combine(format.colorize(), myFormat),
    }),
    infotransport,
    errortransport,
  ],
};

export const Logger = createLogger({ ...winstonLogOptions });

export const nestwinstonLog = WinstonModule.createLogger(winstonLogOptions);

export const requestBodyLog = (requestObj) => {
  let reqobj = { ...requestObj };
  const filter_fields = ['password', 'newpassword'];
  filter_fields.map((item) => {
    if (item in reqobj) {
      reqobj[item] = '[FILTERED]';
    }
  });
  Logger.log('info', 'Request Body:  %o', reqobj, { label: 'Request' });
};
export const responseBodyLog = (responseObj) => {
  Logger.log('info', 'Response Body:  %o', responseObj || {}, {
    label: 'Response',
  });
};

export const HttpEndpointLog = (endpointData) => {
  const { method, originalUrl, statusCode, contentLength, userAgent, ip } =
    endpointData;

  if (
    statusCode.toString().startsWith(1) ||
    statusCode.toString().startsWith(2)
  ) {
    Logger.log(
      'info',
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      { label: 'Endpoint' },
    );
  } else if (statusCode.toString().startsWith(5)) {
    Logger.log(
      'error',
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      { label: 'Endpoint' },
    );
  } else {
    Logger.log(
      'warn',
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      { label: 'Endpoint' },
    );
  }
};

export const HttpUrlLog = ({
  method,
  originalUrl,
  statusCode,
  contentLength,
  userAgent,
  ip,
}) => {
  //log http info...
  if (
    statusCode.toString().startsWith(1) ||
    statusCode.toString().startsWith(2)
  ) {
    Logger.log(
      'info',
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      { label: 'Route' },
    );
  } else {
    Logger.log(
      'warn',
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      { label: 'Route' },
    );
  }
};
export const HttpPortLog = (environment, port) => {
  Logger.log(
    'debug',
    'App is running in the %s environment on port %s',
    environment,
    port,
    { label: 'App' },
  );
};

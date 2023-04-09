import winston from 'winston';

const options = {
  file: {
    level: 'debug',
    filename: './logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true,
  },
};

const loggerOptions = {
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File(options.file)
  ],
  exitOnError: false,
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
};

if (process.env.DEBUG === "true") {
  loggerOptions.transports.push(new winston.transports.Console(options.console));
}

const logger = winston.createLogger(loggerOptions);
export default logger;

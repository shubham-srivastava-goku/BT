import Express from "express";
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { cpus } from 'os';
import { readFileSync } from 'fs';
import process from 'process';
import cluster from 'cluster';
import router from './routes/parkingLot.route.js';
import logger from './logger/logger.js';

const readSwaggerFile = () => {
  return JSON.parse(readFileSync('./swagger/swagger-output.json', { encoding: 'utf8', flag: 'r' }));
}

const startServer = () => {
  logger.debug('Starting server');
  const app = Express();
  const server = http.createServer(app);

  app.use('/', router);
  app.use('/doc', swaggerUi.serve, swaggerUi.setup(readSwaggerFile()))
  server.listen(8080, () => {
    logger.log('info', 'Server started on port %s', '8080');
  });
}

if (cluster.isPrimary) {
  logger.log('debug', 'Primary %s is running', process.pid);
  for (let i = 0; i < cpus().length; i += 1) {
    logger.log('debug', 'Spawning a new worker');
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.log('error', 'worker %s died', worker.process.pid);
    logger.log('debug', 'Spawning a new worker');
    cluster.fork();
  });
} else {
  startServer();
}

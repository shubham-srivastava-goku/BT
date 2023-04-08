import Express from "express";
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { cpus } from 'os';
import { readFileSync } from 'fs';
import process from 'process';
import cluster from 'cluster';
// import swaggerFile from './swagger/swagger-output.json' assert { type: "json" };
import router from './routes/parkingLot.route.js';


const readSwaggerFile = () => {
  return JSON.parse(readFileSync('./swagger/swagger-output.json', { encoding: 'utf8', flag: 'r' }));
}

const startServer = () => {
  const app = Express();
  const server = http.createServer(app);

  app.use('/', router);
  app.use('/doc', swaggerUi.serve, swaggerUi.setup(readSwaggerFile()))
  server.listen(8080, () => {
    console.log('Server started on port %s', 8080);
  });
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  // Fork workers.
  // for (let i = 0; i < cpus().length; i+= 1) {
  cluster.fork();
  //}

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // starting a new worker
    cluster.fork();
  });
} else {
  startServer();
}

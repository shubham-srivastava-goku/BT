import swaggerAutogen from 'swagger-autogen';
const doc = {
  info: {
    title: 'Parking lot APIs',
  },
  host: 'localhost:8080',
  schemes: ['http'],
};

const outputFile = './swagger/swagger-output.json';
const endpointsFiles = ['routes/parkingLot.route.js'];
swaggerAutogen()(outputFile, endpointsFiles, doc);

const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Ezsouq Project',
        description: 'API Documentation',
    },
    host: 'api.ezsouq.store',
    schemes: ['https'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(()=>{
    require('./server');
})
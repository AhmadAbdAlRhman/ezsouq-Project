const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const server = http.createServer(app);

// إعداد Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: '*',
        credentials: true
    }
});

// إعداد Socket
const { setupSocket } = require('./socket/socket');
setupSocket(io);

// جعل io متاحاً في التطبيق
app.set('io', io);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*'
}));
app.use('/uploads/images', express.static('uploads/images'));
app.use('/uploads/videos', express.static('uploads/videos'));
app.use('/uploads/users', express.static('uploads/users'));
require('./models/linking');
app.use(express.json());
const auth = require("./routes/Authintication");
const admin = require("./routes/admin");
const user = require("./routes/user");
app.use(auth);
app.use('/user',user);
app.use('/admin',admin);
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
server.listen(3010, () => {
    console.log(`🚀 Server listening on http://localhost:3010`);
    console.log(`🔌 Socket.io ready for connections`);
})
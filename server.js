const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*'
}));
app.use('/uploads/images', express.static('uploads/images'));
app.use('/uploads/videos', express.static('uploads/videos'));
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
app.listen(3010, () => {
    console.log(`🚀 Server listening on http://localhost:3010`);
})
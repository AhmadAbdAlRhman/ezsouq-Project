const express = require('express');
require('./models/linking');
const app = express();
const auth = require("./routes/Auth");
app.use(auth);
app.listen(3010, () => {
    console.log(`🚀 Server listening on http://localhost:3010`);
})
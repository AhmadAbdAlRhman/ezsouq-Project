const express = require('express');
const app = express();
app.use(express.json());
require('./models/linking');
const auth = require("./routes/Authintication");
app.use(auth);
app.listen(3010, () => {
    console.log(`🚀 Server listening on http://localhost:3010`);
})
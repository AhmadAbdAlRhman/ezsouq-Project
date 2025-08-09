const connectDB = require('../config/db');

connectDB();

require('./users');
require('./email_user');
require('./google_user');
require('./BlacklistToken');
require('./Category');
require('./Governorates');
require('./products');
require('./feedback');
require('./Report');

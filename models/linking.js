const connectDB = require('../config/db');

connectDB();

require('./users');
require('./BlacklistToken');
require('./Category');
require('./Governorates');
require('./products');
require('./feedback');
require('./Report');
require('./Message');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load env variables
dotenv.config({ path: './config/config.env' });
// Init app
const app = express();
// Connect to database
require('./config/db')();
// Index route
app.get('/', (req, res) => {
	res.json({ msg: 'Welcome to DevCamper API' });
});
// Logger
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
// Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
// Listen to port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

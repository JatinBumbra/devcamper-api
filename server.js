const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
// Load env variables
dotenv.config({ path: './config/config.env' });
// Connect to database
require('./config/db')();
// Init app
const app = express();
// Logger
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// File upload
app.use(fileupload());
// Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
// Middleware
app.use(errorHandler);
// Index route
app.get('/', (req, res) => {
	res.json({ msg: 'Welcome to DevCamper API' });
});
// Listen to port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
	)
);
// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	server.close(() => process.exit());
});

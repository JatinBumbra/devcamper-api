const ErrorResponse = require('../utils/errorResponse');

module.exports = (err, req, res, next) => {
	console.log(err.stack.red);

	let error = { ...err };
	error.message = err.message;
	// Handle CastError
	if (err.name === 'CastError') {
		const message = `Resource with ID ${err.value} not found`;
		error = new ErrorResponse(message, 404);
	}
	// Handle duplication error
	if (err.code === 11000) {
		const message = 'Duplication error';
		error = new ErrorResponse(message, 400);
	}
	// Mongoose validation error
	if (err.name === 'ValidationError') {
		message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 400);
	}
	// Send message
	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
	});
};

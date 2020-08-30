const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

// @route     POST /api/v1/auth/register
// @desc      Register a user
// @access    Public
exports.registerUser = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;
	const user = await User.create({
		name,
		email,
		password,
		role,
	});
	sendTokenResponse(user, 200, res);
});

// @route     POST /api/v1/auth/login
// @desc      Login a user
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	// Validate email and password
	if (!email || !password) {
		return next(new ErrorResponse('Please provide a email and password', 400));
	}
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}
	const match = await user.verifyPassword(password);
	if (!match) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}
	sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.generateToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}
	res
		.status(statusCode)
		.cookie('token', token, options)
		.json({ success: true, token });
};

// @route     POST /api/v1/auth/me
// @desc      Get current user
// @access    Private
exports.currentUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		data: user,
	});
});

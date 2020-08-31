const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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

// @route     GET /api/v1/auth/me
// @desc      Get current user
// @access    Private
exports.currentUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		data: user,
	});
});

// @route     PUT /api/v1/auth/updatedetails
// @desc      Update user details
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @route     PUT /api/v1/auth/updatepassword
// @desc      Update password
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	// Check current password
	if (!(await user.verifyPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}
	user.password = req.body.newPassword;
	await user.save();
	sendTokenResponse(user, 200, res);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @route     POST /api/v1/auth/forgotpassword
// @desc      Forgot password
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new ErrorResponse(`No user with that email`, 404));
	}
	// Get reset token
	const resetToken = user.getResetToken();
	await user.save({ validateBeforeSave: false });

	// Create reset URL
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested for a password reset. Please make a put request to: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password Reset',
			message,
		});

		res.status(200).json({ success: true, data: 'Email sent' });
	} catch (error) {
		console.log(error);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse('Email could not be sent', 500));
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @route     PUT /api/v1/auth/resetpassword/:token
// @desc      Reset password
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	// Hash the token and match it with the User
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');
	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});
	if (!user) {
		return next(new ErrorResponse('Invalid Token', 400));
	}
	// Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

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

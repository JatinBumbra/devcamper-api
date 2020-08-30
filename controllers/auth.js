const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

// @route     GET /api/v1/auth/register
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
	res.status(200).json({ success: true });
});

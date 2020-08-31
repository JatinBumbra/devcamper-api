const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @route     GET /api/v1/reviews
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @desc      Get all reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @route     GET /api/v1/reviews/:id
// @desc      Get a review
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(`Review with id ${req.params.id} not found`, 404)
		);
	}

	res.status(200).json({ success: true, data: review });
});

// @route     POST /api/v1/bootcamps/:bootcampId/reviews
// @desc      Add a review
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp with id ${req.params.bootcampId} not found`,
				404
			)
		);
	}
	const review = await Review.create(req.body);

	res.status(201).json({ success: true, data: review });
});

// @route     PUT /api/v1/reviews/:id
// @desc      Update a review
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
	console.log(req.user);
	let review = await Review.findById(req.params.id);
	if (!review) {
		return next(
			new ErrorResponse(`No review with id ${req.params.id} found`, 404)
		);
	}
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(`You cannot edit somebody else's review`, 401)
		);
	}
	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({ success: true, data: review });
});

// @route     DELETE /api/v1/reviews/:id
// @desc      Delete a review
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);
	if (!review) {
		return next(
			new ErrorResponse(`No review with id ${req.params.id} found`, 404)
		);
	}
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(`You cannot delete somebody else's review`, 401)
		);
	}
	await review.remove();
	res.status(200).json({ success: true, data: {} });
});

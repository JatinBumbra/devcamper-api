const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @desc      Get all courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const courses = await Course.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @route     GET /api/v1/courses/:id
// @desc      Get single course
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await (await Course.findById(req.params.id)).populate({
		path: 'bootcamp',
		select: 'name description',
	});
	if (!course) {
		return next(
			new ErrorResponse(`No course found with id ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		data: course,
	});
});

// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @desc      Add a course
// @access    Private
exports.addCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;
	const bootcamp = await Bootcamp.findById(req.params.bootcampId);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
		);
	}
	// Make sure the bootcamp owner is the logged in user
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not allowed to add a course to bootcamp ${bootcamp._id}`,
				401
			)
		);
	}
	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course,
	});
});

// @route     PUT /api/v1/courses/:id
// @desc      Update a course
// @access    Public
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);
	if (!course) {
		return next(
			new ErrorResponse(`No course found with id ${req.params.id}`, 404)
		);
	}
	// Make sure the course owner is the logged in user
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not allowed to update course ${course._id}`,
				401
			)
		);
	}
	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: course,
	});
});

// @route     DELETE /api/v1/courses/:id
// @desc      Delete a course
// @access    Public
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);
	if (!course) {
		return next(
			new ErrorResponse(`No course found with id ${req.params.id}`, 404)
		);
	}
	// Make sure the course owner is the logged in user
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not allowed to delete course ${course._id}`,
				401
			)
		);
	}
	await course.remove();
	res.status(200).json({
		success: true,
		data: {},
	});
});

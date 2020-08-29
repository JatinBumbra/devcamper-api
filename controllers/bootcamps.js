const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @route     GET /api/v1/bootcamps
// @desc      Get all bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;

	const reqQuery = { ...req.query };
	// Fields to exclude
	const removeFields = ['select', 'sort', 'limit', 'page'];
	// Loop over remove fields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);
	// Create query String
	let queryString = JSON.stringify(reqQuery);
	queryString = queryString.replace(
		/\b{gt|lt|gte|lte|in}\b/g,
		(match) => `$${match}`
	);
	query = Bootcamp.find(JSON.parse(queryString));
	// Select fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
	}
	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}
	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments();
	query = query.skip(startIndex).limit(limit);
	// Execute query
	const bootcamps = await query;
	// Pagination result
	const pagination = {};
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}
	// Return response
	res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps,
	});
});

// @route     POST /api/v1/bootcamps
// @desc      Create a bootcamp
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

// @route     GET /api/v1/bootcamps/:id
// @desc      Get single bootcamp
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	console.log(req.params.id);
	const bootcamp = await Bootcamp.findById(req.params.id);
	console.log(bootcamp);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
		);
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @route     PUT /api/v1/bootcamps/:id
// @desc      Update a bootcamp
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
		);
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @route     DELETE /api/v1/bootcamps/:id
// @desc      Delete a bootcamp
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
		);
	}
	res.status(200).json({ success: true, data: {} });
});

// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @desc      Get bootcamps within a radius
// @access    Private
exports.getBootcampsByRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;
	// Get lat/long from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const long = loc[0].longitude;
	// Calc radius using radians
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
	});
	res
		.status(200)
		.json({ success: true, count: bootcamps.length, data: bootcamps });
});

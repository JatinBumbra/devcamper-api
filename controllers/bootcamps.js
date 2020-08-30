const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// @route     GET /api/v1/bootcamps
// @desc      Get all bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	// Return response
	res.status(200).json(res.advancedResults);
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
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
		);
	}
	bootcamp.remove();
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

// @route     PUT /api/v1/bootcamps/:id/photo
// @desc      Upload photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
		);
	}
	if (!req.files) {
		return next(new ErrorResponse('No file uploaded', 400));
	}
	const file = req.files.file;
	// Make sure file uploaded is an image
	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse('File must be an image', 400));
	}
	// Bound the file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`File must be less than ${process.env.MAX_FILE_UPLOAD}`,
				400
			)
		);
	}
	// Create custom file name
	file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
		if (error) {
			console.error(error);
			return next(new ErrorResponse('Problem with file upload', 500));
		}
		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
		res.status(200).json({
			success: true,
			data: file.name,
		});
	});
});

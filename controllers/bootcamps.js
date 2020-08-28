const Bootcamp = require('../models/Bootcamp');

// @route     GET /api/v1/bootcamps
// @desc      Get all bootcamps
// @access    Public
exports.getBootcamps = async (req, res, next) => {
	try {
		const bootcamps = await Bootcamp.find();
		res.status(200).json({
			success: true,
			count: bootcamps.length,
			data: bootcamps,
		});
	} catch (error) {
		res.status(404).json({ success: false });
	}
};

// @route     POST /api/v1/bootcamps
// @desc      Create a bootcamp
// @access    Private
exports.createBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.create(req.body);
		res.status(201).json({
			success: true,
			data: bootcamp,
		});
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

// @route     GET /api/v1/bootcamps/:id
// @desc      Get single bootcamp
// @access    Public
exports.getBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findById(req.params.id);
		if (!bootcamp) {
			return res.status(404).json({ success: false });
		}
		res.status(200).json({ success: true, data: bootcamp });
	} catch (error) {
		res.status(404).json({ success: false });
	}
};

// @route     PUT /api/v1/bootcamps/:id
// @desc      Update a bootcamp
// @access    Private
exports.updateBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!bootcamp) {
			return res.status(404).json({ success: false });
		}
		res.status(200).json({ success: true, data: bootcamp });
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

// @route     DELETE /api/v1/bootcamps/:id
// @desc      Delete a bootcamp
// @access    Private
exports.deleteBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
		if (!bootcamp) {
			return res.status(404).json({ success: false });
		}
		res.status(200).json({ success: true, data: {} });
	} catch (error) {}
	res.json({ success: true });
};

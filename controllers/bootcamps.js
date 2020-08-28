// @route     GET /api/v1/bootcamps
// @desc      Get all bootcamps
// @access    Public
exports.getBootcamps = (req, res, next) => {
	res.json({ success: true });
};

// @route     POST /api/v1/bootcamps
// @desc      Create a bootcamp
// @access    Private
exports.createBootcamp = (req, res, next) => {
	res.json({ success: true });
};

// @route     GET /api/v1/bootcamps/:id
// @desc      Get single bootcamp
// @access    Public
exports.getBootcamp = (req, res, next) => {
	res.json({ success: true });
};

// @route     PUT /api/v1/bootcamps/:id
// @desc      Update a bootcamp
// @access    Private
exports.updateBootcamp = (req, res, next) => {
	res.json({ success: true });
};

// @route     DELETE /api/v1/bootcamps/:id
// @desc      Delete a bootcamp
// @access    Private
exports.deleteBootcamp = (req, res, next) => {
	res.json({ success: true });
};

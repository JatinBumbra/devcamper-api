const router = require('express').Router();
const {
	getBootcamp,
	getBootcamps,
	updateBootcamp,
	createBootcamp,
	deleteBootcamp,
	getBootcampsByRadius,
	bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resource router
const courseRouter = require('./courses');
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsByRadius);

router
	.route('/')
	.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
	.post(createBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;

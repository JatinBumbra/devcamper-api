const router = require('express').Router();
const {
	getBootcamp,
	getBootcamps,
	updateBootcamp,
	createBootcamp,
	deleteBootcamp,
	getBootcampsByRadius,
} = require('../controllers/bootcamps');

router.route('/radius/:zipcode/:distance').get(getBootcampsByRadius);

router.route('/').get(getBootcamps).post(createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;

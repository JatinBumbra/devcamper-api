const router = require('express').Router();
const {
	registerUser,
	login,
	currentUser,
	forgotPassword,
	resetPassword,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', login);
router.get('/me', protect, currentUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;

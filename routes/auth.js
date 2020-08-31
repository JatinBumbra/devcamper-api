const router = require('express').Router();
const {
	registerUser,
	login,
	currentUser,
	forgotPassword,
	resetPassword,
	updateDetails,
	updatePassword,
	logout,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, currentUser);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;

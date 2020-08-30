const router = require('express').Router();
const { registerUser, login, currentUser } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', login);
router.get('/me', protect, currentUser);

module.exports = router;

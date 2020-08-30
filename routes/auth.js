const router = require('express').Router();
const { registerUser } = require('../controllers/auth');

router.post('/register', registerUser);

module.exports = router;

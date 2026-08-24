const express = require('express');
const auth = require('../middleware/auth');
const { evaluateInterview } = require('../controllers/jobController');
const router = express.Router();
router.post('/evaluate', auth, evaluateInterview);
module.exports = router;

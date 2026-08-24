const express = require('express');
const auth = require('../middleware/auth');
const { listJobs, matchJob, createJob } = require('../controllers/jobController');
const router = express.Router();
router.get('/', auth, listJobs);
router.post('/', auth, createJob);
router.post('/match', auth, matchJob);
module.exports = router;

const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { uploadResume } = require('../controllers/resumeController');

const maxMb = Number(process.env.MAX_FILE_SIZE_MB || 5);
const upload = multer({ limits: { fileSize: maxMb * 1024 * 1024 }, storage: multer.memoryStorage() });
const router = express.Router();
router.post('/upload', auth, upload.single('resume'), uploadResume);
module.exports = router;

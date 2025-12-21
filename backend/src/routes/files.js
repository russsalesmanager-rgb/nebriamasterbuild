const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const models = require('../models');
const { uploadFile } = require('../services/storageService');

const router = express.Router();

// Configure multer for file uploads (store temporarily on disk)
const upload = multer({ dest: 'tmp/uploads/' });

// Upload a file
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: { code: 'NO_FILE', message: 'No file provided' } });
  }
  const { originalname, mimetype, filename, size, path: filePath } = req.file;
  try {
    // Generate a unique remote key
    const ext = path.extname(originalname);
    const remoteKey = `${req.user.id}/${Date.now()}_${filename}${ext}`;
    // Upload to S3/R2
    const result = await uploadFile(filePath, remoteKey);
    // Create file record
    const file = await models.File.create({
      userId: req.user.id,
      originalName: originalname,
      url: result.url,
      type: mimetype.startsWith('image/') ? 'IMAGE' : mimetype.startsWith('video/') ? 'VIDEO' : 'OTHER',
      size,
      mimeType: mimetype
    });
    // Remove tmp file
    fs.unlink(filePath, () => {});
    return res.status(201).json({ ok: true, data: file });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: { code: 'UPLOAD_FAILED', message: 'File upload failed', details: err.message } });
  }
});

module.exports = router;